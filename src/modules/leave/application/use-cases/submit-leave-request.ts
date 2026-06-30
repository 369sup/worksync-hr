import type { Clock } from "@/shared/kernel/clock";

import { LeaveRequest } from "../../domain/aggregates/leave-request";
import { LeaveRequestId } from "../../domain/value-objects/leave-request-id";
import type { LeaveEligibilityPolicy } from "../../domain/policies/leave-eligibility-policy";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { SubmitLeaveRequestCommand } from "../commands/submit-leave-request.command";
import { LeaveApplicationError } from "../errors/leave-application-error";
import type { EmployeeSnapshotQueryPort } from "../ports/outbound/employee-snapshot-query-port";
import type { LeaveCommandTransactionPort } from "../ports/outbound/leave-command-transaction-port";
import type { IdentifierGeneratorPort } from "../ports/outbound/identifier-generator-port";
import type { LeaveTypeSnapshotQueryPort } from "../ports/outbound/leave-type-snapshot-query-port";
import type { WorkScheduleSnapshotQueryPort } from "../ports/outbound/work-schedule-snapshot-query-port";
import { assertActiveMembership } from "./leave-use-case-support";

export class SubmitLeaveRequestUseCase {
  constructor(
    private readonly repository: LeaveRequestRepository,
    private readonly employees: EmployeeSnapshotQueryPort,
    private readonly workSchedules: WorkScheduleSnapshotQueryPort,
    private readonly leaveTypes: LeaveTypeSnapshotQueryPort,
    private readonly eligibilityPolicy: LeaveEligibilityPolicy,
    private readonly identifiers: IdentifierGeneratorPort,
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
    const leaveType = await this.leaveTypes.getLeaveTypeSnapshot({
      tenantId: actor.tenantId,
      leaveTypeId: command.leaveTypeId,
      effectiveAt: submittedAt.toISOString(),
    });
    if (!leaveType || leaveType.status !== "active") {
      throw new LeaveApplicationError(
        "INVALID_INPUT",
        "Leave type is not available.",
      );
    }
    const employee = await this.employees.getEmployeeSnapshot({
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
    if (employee.status !== "active") {
      throw new LeaveApplicationError(
        "EMPLOYEE_NOT_ELIGIBLE_FOR_LEAVE",
        "Employee is not eligible for leave.",
      );
    }
    const schedule = await this.workSchedules.getWorkScheduleSnapshot({
      tenantId: actor.tenantId,
      employeeId: actor.employeeId,
      startAt: command.startAt.toISOString(),
      endAt: command.endAt.toISOString(),
    });
    if (!schedule) {
      throw new LeaveApplicationError(
        "WORK_SCHEDULE_NOT_AVAILABLE",
        "Published work schedule is not available.",
      );
    }

    this.eligibilityPolicy.assertEligible({
      employee,
      schedule,
      leaveTypeId: command.leaveTypeId,
      leaveTypeCode: leaveType.code,
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
      id: LeaveRequestId.create(this.identifiers.generate("leave")),
      employeeId: actor.employeeId,
      leaveTypeId: command.leaveTypeId,
      leaveTypeCode: leaveType.code,
      startAt: command.startAt,
      endAt: command.endAt,
      reason: command.reason,
      submittedAt,
    });

    const snapshot = await this.transactions.commit({
      tenantId: actor.tenantId,
      actor,
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
