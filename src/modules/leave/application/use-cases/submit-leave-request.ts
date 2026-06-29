import type { Clock } from "@/shared/kernel/clock";

import { LeaveRequest } from "../../domain/aggregates/leave-request";
import type { LeaveEligibilityPolicy } from "../../domain/policies/leave-eligibility-policy";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { SubmitLeaveRequestCommand } from "../commands/submit-leave-request.command";
import { LeaveApplicationError } from "../errors/leave-application-error";
import type { EmployeeLeaveProfileQueryPort } from "../ports/outbound/employee-leave-profile-query-port";
import type { LeaveCommandTransactionPort } from "../ports/outbound/leave-command-transaction-port";
import type { LeaveWorkCalendarQueryPort } from "../ports/outbound/leave-work-calendar-query-port";
import { assertActiveMembership } from "./leave-use-case-support";

export class SubmitLeaveRequestUseCase {
  constructor(
    private readonly repository: LeaveRequestRepository,
    private readonly employeeProfiles: EmployeeLeaveProfileQueryPort,
    private readonly workCalendars: LeaveWorkCalendarQueryPort,
    private readonly eligibilityPolicy: LeaveEligibilityPolicy,
    private readonly clock: Clock,
    private readonly transactions: LeaveCommandTransactionPort,
  ) {}

  async execute(command: SubmitLeaveRequestCommand) {
    const { actor } = command;
    assertActiveMembership(actor);
    if (
      !actor.employeeId ||
      !actor.capabilities.includes("leave.submit.self")
    ) {
      throw new LeaveApplicationError(
        "FORBIDDEN",
        "Leave submission is not allowed.",
      );
    }

    const idempotency = {
      tenantId: actor.tenantId,
      operatorId: actor.userId,
      key: command.idempotencyKey,
      payload: {
        employeeId: actor.employeeId,
        leaveTypeId: command.leaveTypeId,
        leaveTypeCode: command.leaveTypeCode,
        startAt: command.startAt.toISOString(),
        endAt: command.endAt.toISOString(),
        reason: command.reason.trim(),
      },
    } as const;
    const replay = await this.transactions.findIdempotentResult(idempotency);
    if (replay) {
      return { leaveRequestId: replay.id, status: replay.status } as const;
    }

    const submittedAt = this.clock.now();
    const employee = await this.employeeProfiles.getEmployeeLeaveSnapshot({
      tenantId: actor.tenantId,
      employeeId: actor.employeeId,
      effectiveAt: submittedAt.toISOString(),
    });
    if (!employee) {
      throw new LeaveApplicationError(
        "EMPLOYEE_NOT_FOUND",
        "Employee profile was not found.",
      );
    }
    if (employee.employmentStatus !== "active") {
      throw new LeaveApplicationError(
        "EMPLOYEE_NOT_ELIGIBLE_FOR_LEAVE",
        "Employee is not eligible for leave.",
      );
    }
    if (!employee.assignedCalendarId) {
      throw new LeaveApplicationError(
        "CALENDAR_NOT_ASSIGNED",
        "Employee does not have an assigned work calendar.",
      );
    }

    const calendar = await this.workCalendars.getLeaveWorkCalendar({
      tenantId: actor.tenantId,
      employeeId: actor.employeeId,
      assignedCalendarId: employee.assignedCalendarId,
      timezone: employee.timezone,
      startAt: command.startAt.toISOString(),
      endAt: command.endAt.toISOString(),
    });
    if (!calendar) {
      throw new LeaveApplicationError(
        "CALENDAR_NOT_AVAILABLE",
        "Work calendar is not available.",
      );
    }

    this.eligibilityPolicy.assertEligible({
      employee,
      calendar,
      leaveTypeId: command.leaveTypeId,
      leaveTypeCode: command.leaveTypeCode,
      startAt: command.startAt,
      endAt: command.endAt,
    });

    if (
      await this.repository.hasOverlap({
        tenantId: actor.tenantId,
        employeeId: actor.employeeId,
        startAt: command.startAt,
        endAt: command.endAt,
      })
    ) {
      throw new LeaveApplicationError(
        "LEAVE_REQUEST_OVERLAP",
        "Leave request overlaps an existing request.",
      );
    }

    const request = LeaveRequest.submit({
      tenantId: actor.tenantId,
      employeeId: actor.employeeId,
      leaveTypeId: command.leaveTypeId,
      leaveTypeCode: command.leaveTypeCode,
      startAt: command.startAt,
      endAt: command.endAt,
      reason: command.reason,
      submittedAt,
    });

    const snapshot = await this.transactions.commit({
      tenantId: actor.tenantId,
      actorId: actor.userId,
      correlationId: actor.correlationId,
      action: "LeaveRequestSubmitted",
      occurredAt: submittedAt,
      request,
      domainEvents: request.pullDomainEvents(),
      idempotency: {
        operatorId: idempotency.operatorId,
        key: idempotency.key,
        payload: idempotency.payload,
      },
    });
    return { leaveRequestId: snapshot.id, status: snapshot.status } as const;
  }
}
