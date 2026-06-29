import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import { LeaveApplicationError } from "../errors/leave-application-error";
import type { LeaveRequestQueryPort } from "../ports/outbound/leave-request-query-port";
import type { LeaveVisibilityQueryPort } from "../ports/outbound/leave-visibility-query-port";
import { resolveVisibility } from "./leave-use-case-support";

export class GetLeaveRequestDetailUseCase {
  constructor(
    private readonly queries: LeaveRequestQueryPort,
    private readonly visibility: LeaveVisibilityQueryPort,
    private readonly clock: Clock,
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
      includeSensitive: true,
    });
    if (!detail) {
      throw new LeaveApplicationError(
        "NOT_FOUND",
        "Leave request was not found.",
      );
    }
    return detail;
  }
}
