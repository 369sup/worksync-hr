import { describe, expect, it } from "vitest";

import { ActorContextFactory } from "./actor-context-factory";

const identity = {
  userId: "firebase-user-1",
  email: "employee@example.com",
  emailVerified: true,
  providerId: "google.com",
};

describe("ActorContextFactory", () => {
  it("uses internal membership as the authorization source", async () => {
    const factory = new ActorContextFactory("tenant_test", {
      async getMembership(input) {
        return {
          ...input,
          employeeId: "EMP-001",
          status: "active",
          capabilities: ["leave.submit.self"],
        };
      },
    });

    await expect(factory.create(identity, "correlation-1")).resolves.toEqual({
      tenantId: "tenant_test",
      userId: "firebase-user-1",
      employeeId: "EMP-001",
      membershipStatus: "active",
      capabilities: ["leave.submit.self"],
      correlationId: "correlation-1",
    });
  });

  it("rejects a missing membership even for a verified Firebase identity", async () => {
    const factory = new ActorContextFactory("tenant_test", {
      async getMembership() {
        return null;
      },
    });

    await expect(
      factory.create(identity, "correlation-1"),
    ).rejects.toMatchObject({
      code: "MEMBERSHIP_INACTIVE",
    });
  });
});
