import type { ActorContext } from "@/shared/types/actor-context";

import type { AuthenticatedIdentity } from "./firebase-authentication-adapter";

export interface OrganizationMembershipSnapshot {
  readonly tenantId: string;
  readonly userId: string;
  readonly employeeId: string | null;
  readonly status: "active" | "inactive";
  readonly capabilities: readonly string[];
}

export interface OrganizationMembershipQueryPort {
  getMembership(input: {
    readonly tenantId: string;
    readonly userId: string;
  }): Promise<OrganizationMembershipSnapshot | null>;
}

export class MembershipInactiveError extends Error {
  readonly code = "MEMBERSHIP_INACTIVE";

  constructor() {
    super("Active organization membership is required.");
    this.name = "MembershipInactiveError";
  }
}

export class ActorContextFactory {
  constructor(
    private readonly tenantId: string,
    private readonly memberships: OrganizationMembershipQueryPort,
  ) {}

  async create(
    identity: AuthenticatedIdentity,
    correlationId: string,
  ): Promise<ActorContext> {
    const membership = await this.memberships.getMembership({
      tenantId: this.tenantId,
      userId: identity.userId,
    });
    if (!membership || membership.status !== "active")
      throw new MembershipInactiveError();

    return {
      tenantId: membership.tenantId,
      userId: membership.userId,
      employeeId: membership.employeeId,
      membershipStatus: membership.status,
      capabilities: [...membership.capabilities],
      correlationId,
    };
  }
}
