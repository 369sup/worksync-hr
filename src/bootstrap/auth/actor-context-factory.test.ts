import { describe, expect, it } from "vitest";

import { ActorContextFactory } from "./actor-context-factory";

const identity = {
  userId: "firebase-user-1",
  email: "employee@example.com",
  emailVerified: true,
  providerId: "google.com",
};

describe("ActorContextFactory", () => {
  it("derives tenant and authorization from internal membership", async () => {
    const factory = new ActorContextFactory({
      async findActiveMembershipByUserId(input) {
        return {
          tenantId: "tenant_test",
          membershipId: "MEM-001",
          userId: input.userId,
          employeeId: "EMP-001",
          organizationUnitId: "ORG-001",
          status: "active",
          roles: ["Employee"],
          capabilities: ["leave.submit.self"],
        };
      },
    });

    await expect(
      factory.create(identity, {
        requestId: "request-1",
        requestSource: "api",
      }),
    ).resolves.toEqual({
      tenantId: "tenant_test",
      userId: "firebase-user-1",
      employeeId: "EMP-001",
      membershipId: "MEM-001",
      membershipStatus: "active",
      capabilities: ["leave.submit.self"],
      scope: {
        kind: "organization-units",
        organizationUnitIds: ["ORG-001"],
      },
      requestId: "request-1",
      requestSource: "api",
    });
  });

  it("rejects a missing membership even for a verified Firebase identity", async () => {
    const factory = new ActorContextFactory({
      async findActiveMembershipByUserId() {
        return null;
      },
    });

    await expect(
      factory.create(identity, {
        requestId: "request-1",
        requestSource: "api",
      }),
    ).rejects.toMatchObject({ code: "MEMBERSHIP_INACTIVE" });
  });
});
