import type { ActorContext } from "@/shared/types/actor-context";

import type { AuthenticatedIdentity } from "./firebase-authentication-adapter";

export interface OrganizationMembershipSnapshot {
  readonly tenantId: string;
  readonly membershipId: string;
  readonly userId: string;
  readonly employeeId: string | null;
  readonly organizationUnitId: string | null;
  readonly status: "active" | "inactive";
  readonly roles: readonly string[];
  readonly capabilities: readonly string[];
}

export interface OrganizationMembershipSnapshotQueryPort {
  findActiveMembershipByUserId(input: {
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
    private readonly memberships: OrganizationMembershipSnapshotQueryPort,
  ) {}

  async create(
    identity: AuthenticatedIdentity,
    request: {
      readonly requestId: string;
      readonly requestSource: "ui" | "api" | "system" | "batch";
    },
  ): Promise<ActorContext> {
    const membership = await this.memberships.findActiveMembershipByUserId({
      userId: identity.userId,
    });
    if (!membership || membership.status !== "active")
      throw new MembershipInactiveError();

    return {
      tenantId: membership.tenantId,
      userId: membership.userId,
      employeeId: membership.employeeId,
      membershipId: membership.membershipId,
      membershipStatus: membership.status,
      capabilities: [...membership.capabilities],
      scope: membership.capabilities.includes("permissions.manage")
        ? { kind: "tenant" }
        : membership.organizationUnitId
          ? {
              kind: "organization-units",
              organizationUnitIds: [membership.organizationUnitId],
            }
          : { kind: "self" },
      requestId: request.requestId,
      requestSource: request.requestSource,
    };
  }
}
