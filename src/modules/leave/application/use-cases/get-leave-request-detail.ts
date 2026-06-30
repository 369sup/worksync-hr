import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import { LeaveApplicationError } from "../errors/leave-application-error";
import type { AuditPort } from "../ports/outbound/audit-port";
import type { LeaveRequestQueryPort } from "../ports/outbound/leave-request-query-port";
import type { OrganizationTeamScopeQueryPort } from "../ports/outbound/organization-team-scope-query-port";
import { resolveVisibility } from "./leave-use-case-support";

export class GetLeaveRequestDetailUseCase {
  constructor(
    private readonly queries: LeaveRequestQueryPort,
    private readonly visibility: OrganizationTeamScopeQueryPort,
    private readonly clock: Clock,
    private readonly audit: AuditPort,
  ) {}

  async execute(input: { actor: ActorContext; leaveRequestId: string }) {
    const visibility = await resolveVisibility({
      actor: input.actor,
      visibility: this.visibility,
      clock: this.clock,
    });
    const detail = await this.queries.getDetail({
      tenantId: input.actor.tenantId,
      leaveRequestId: input.leaveRequestId,
      visibility,
      includeSensitive:
        input.actor.capabilities.includes("leave.read.self") ||
        input.actor.capabilities.includes("leave.approve.team") ||
        input.actor.capabilities.includes("leave.override"),
    });
    if (!detail) {
      throw new LeaveApplicationError(
        "NOT_FOUND",
        "Leave request was not found.",
      );
    }
    await this.audit.append({
      actor: input.actor,
      action: "SensitiveLeaveRequestViewed",
      targetRef: { type: "LeaveRequest", id: input.leaveRequestId },
      result: "success",
      occurredAt: this.clock.now(),
    });
    return detail;
  }
}
