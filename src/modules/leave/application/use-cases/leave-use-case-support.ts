import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import type { LeaveRequest } from "../../domain/aggregates/leave-request";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import { LeaveRequestId } from "../../domain/value-objects/leave-request-id";
import { LeaveApplicationError } from "../errors/leave-application-error";
import type { LeaveApprovalQueryPort } from "../ports/outbound/leave-approval-query-port";
import type { LeaveRequestVisibilityScope } from "../ports/outbound/leave-request-query-port";
import type { LeaveVisibilityQueryPort } from "../ports/outbound/leave-visibility-query-port";

export function assertActiveMembership(actor: ActorContext) {
  if (actor.membershipStatus !== "active") {
    throw new LeaveApplicationError(
      "MEMBERSHIP_INACTIVE",
      "Active membership is required.",
    );
  }
}

export function assertCapability(actor: ActorContext, capability: string) {
  if (!actor.capabilities.includes(capability)) {
    throw new LeaveApplicationError("FORBIDDEN", "Operation is not allowed.");
  }
}

export async function loadLeaveRequest(
  repository: LeaveRequestRepository,
  tenantId: string,
  leaveRequestId: string,
): Promise<LeaveRequest> {
  const request = await repository.findById(
    tenantId,
    LeaveRequestId.create(leaveRequestId),
  );
  if (!request) {
    throw new LeaveApplicationError(
      "NOT_FOUND",
      "Leave request was not found.",
    );
  }
  return request;
}

export async function assertResolvedApprover(input: {
  actor: ActorContext;
  request: LeaveRequest;
  approval: LeaveApprovalQueryPort;
}) {
  assertActiveMembership(input.actor);
  assertCapability(input.actor, "leave.approve.department");
  if (!input.actor.employeeId) {
    throw new LeaveApplicationError(
      "FORBIDDEN",
      "Approver identity is required.",
    );
  }

  const snapshot = input.request.toSnapshot();
  const assignment = await input.approval.resolveApprover({
    tenantId: input.actor.tenantId,
    employeeId: snapshot.employeeId,
    requestedAt: snapshot.submittedAt,
  });
  if (
    assignment &&
    (assignment.tenantId !== input.actor.tenantId ||
      assignment.employeeId !== snapshot.employeeId)
  ) {
    throw new LeaveApplicationError(
      "UPSTREAM_UNAVAILABLE",
      "Approver scope returned invalid identity data.",
    );
  }
  if (!assignment || assignment.approverId !== input.actor.employeeId) {
    throw new LeaveApplicationError(
      "FORBIDDEN",
      "Leave request is outside the approver scope.",
    );
  }
}

export async function resolveVisibility(input: {
  actor: ActorContext;
  visibility: LeaveVisibilityQueryPort;
  clock: Clock;
}): Promise<LeaveRequestVisibilityScope> {
  assertActiveMembership(input.actor);

  if (input.actor.capabilities.includes("leave.override")) {
    return { kind: "tenant" };
  }

  if (!input.actor.employeeId) {
    throw new LeaveApplicationError(
      "FORBIDDEN",
      "Employee identity is required.",
    );
  }

  const employeeIds = new Set<string>();
  if (input.actor.capabilities.includes("leave.read.self")) {
    employeeIds.add(input.actor.employeeId);
  }
  if (input.actor.capabilities.includes("leave.read.department")) {
    const managed = await input.visibility.getManagedEmployeeIds({
      tenantId: input.actor.tenantId,
      managerEmployeeId: input.actor.employeeId,
      effectiveAt: input.clock.now().toISOString(),
    });
    if (managed.tenantId !== input.actor.tenantId) {
      throw new LeaveApplicationError(
        "UPSTREAM_UNAVAILABLE",
        "Visibility scope returned an invalid tenant.",
      );
    }
    managed.employeeIds.forEach((employeeId) => employeeIds.add(employeeId));
  }

  if (employeeIds.size === 0) {
    throw new LeaveApplicationError(
      "FORBIDDEN",
      "Leave requests are not visible.",
    );
  }
  return { kind: "employees", employeeIds: [...employeeIds] };
}
