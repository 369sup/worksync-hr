import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import type { LeaveRequest } from "../../domain/aggregates/leave-request";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import { LeaveRequestId } from "../../domain/value-objects/leave-request-id";
import { LeaveApplicationError } from "../errors/leave-application-error";
import type { ApprovalAssignmentQueryPort } from "../ports/outbound/approval-assignment-query-port";
import type { LeaveRequestVisibilityScope } from "../ports/outbound/leave-request-query-port";
import type { OrganizationTeamScopeQueryPort } from "../ports/outbound/organization-team-scope-query-port";

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
  approval: ApprovalAssignmentQueryPort;
}) {
  assertActiveMembership(input.actor);
  assertCapability(input.actor, "leave.approve.team");
  if (!input.actor.employeeId) {
    throw new LeaveApplicationError(
      "FORBIDDEN",
      "Approver identity is required.",
    );
  }

  const snapshot = input.request.toSnapshot();
  const assignment = await input.approval.resolveApprovalAssignment({
    tenantId: input.actor.tenantId,
    leaveRequestId: snapshot.id,
    requestedAt: snapshot.submittedAt,
  });
  if (
    assignment &&
    (assignment.tenantId !== input.actor.tenantId ||
      assignment.targetRef.id !== snapshot.id)
  ) {
    throw new LeaveApplicationError(
      "UPSTREAM_UNAVAILABLE",
      "Approver scope returned invalid identity data.",
    );
  }
  const responsibleMembershipId =
    assignment?.delegateMembershipId ?? assignment?.approverMembershipId;
  if (!assignment || responsibleMembershipId !== input.actor.membershipId) {
    throw new LeaveApplicationError(
      "FORBIDDEN",
      "Leave request is outside the approver scope.",
    );
  }
}

export async function resolveVisibility(input: {
  actor: ActorContext;
  visibility: OrganizationTeamScopeQueryPort;
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
  if (input.actor.capabilities.includes("leave.approve.team")) {
    const managed = await input.visibility.getManagedEmployeeIds({
      tenantId: input.actor.tenantId,
      managerMembershipId: input.actor.membershipId,
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
