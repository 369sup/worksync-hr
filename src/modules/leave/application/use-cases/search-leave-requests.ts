import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import type { LeaveRequestSearchCriteria } from "../query-models/leave-request-list-item";
import type { LeaveRequestQueryPort } from "../ports/outbound/leave-request-query-port";
import type { OrganizationTeamScopeQueryPort } from "../ports/outbound/organization-team-scope-query-port";
import { resolveVisibility } from "./leave-use-case-support";

export class SearchLeaveRequestsUseCase {
  constructor(
    private readonly queries: LeaveRequestQueryPort,
    private readonly visibility: OrganizationTeamScopeQueryPort,
    private readonly clock: Clock,
  ) {}

  async execute(input: {
    actor: ActorContext;
    criteria: LeaveRequestSearchCriteria;
  }) {
    const visibility = await resolveVisibility({
      actor: input.actor,
      visibility: this.visibility,
      clock: this.clock,
    });
    return this.queries.search({
      tenantId: input.actor.tenantId,
      visibility,
      criteria: input.criteria,
    });
  }
}
