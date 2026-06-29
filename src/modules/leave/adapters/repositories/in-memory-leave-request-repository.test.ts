import { describe, expect, it } from "vitest";

import { LeaveRequest } from "../../domain/aggregates/leave-request";
import { LeaveRequestId } from "../../domain/value-objects/leave-request-id";
import { InMemoryLeaveRequestRepository } from "./in-memory-leave-request-repository";

describe("InMemoryLeaveRequestRepository", () => {
  it("saves and reloads an aggregate", async () => {
    const repository = new InMemoryLeaveRequestRepository();
    const id = LeaveRequestId.create("leave_test_001");
    const request = LeaveRequest.submit({
      tenantId: "tenant_test",
      id,
      employeeId: "EMP-001",
      leaveTypeId: "LT-001",
      leaveTypeCode: "annual-leave",
      startAt: new Date("2026-07-03T01:00:00.000Z"),
      endAt: new Date("2026-07-03T09:00:00.000Z"),
      reason: "Family appointment",
      submittedAt: new Date("2026-06-28T03:00:00.000Z"),
    });

    await repository.save("tenant_test", request);

    const restored = await repository.findById("tenant_test", id);
    expect(restored?.toSnapshot()).toEqual(request.toSnapshot());
  });

  it("returns query models instead of aggregates", async () => {
    const repository = new InMemoryLeaveRequestRepository();

    const items = await repository.list("tenant_demo");

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).not.toHaveProperty("reason");
  });

  it("enforces tenant and employee visibility in query adapters", async () => {
    const repository = new InMemoryLeaveRequestRepository();

    await expect(
      repository.getDetail({
        tenantId: "other_tenant",
        leaveRequestId: "leave_seed_001",
        visibility: { kind: "tenant" },
        includeSensitive: true,
      }),
    ).resolves.toBeNull();

    const page = await repository.search({
      tenantId: "tenant_demo",
      visibility: { kind: "employees", employeeIds: ["EMP-014"] },
      criteria: { page: 1, pageSize: 20 },
    });
    expect(page.items).toHaveLength(1);
    expect(page.items[0].employeeId).toBe("EMP-014");
  });

  it("commits audit, idempotency, and published events through adapter ports", async () => {
    const repository = new InMemoryLeaveRequestRepository();
    const request = LeaveRequest.submit({
      tenantId: "tenant_test",
      id: LeaveRequestId.create("leave_transaction_001"),
      employeeId: "EMP-001",
      leaveTypeId: "LT-001",
      leaveTypeCode: "annual-leave",
      startAt: new Date("2026-08-03T01:00:00.000Z"),
      endAt: new Date("2026-08-03T09:00:00.000Z"),
      reason: "Family appointment",
      submittedAt: new Date("2026-06-28T04:00:00.000Z"),
    });
    await repository.commit({
      tenantId: "tenant_test",
      actorId: "user-1",
      correlationId: "correlation-1",
      action: "LeaveRequestSubmitted",
      occurredAt: new Date("2026-06-28T04:00:00.000Z"),
      request,
      domainEvents: request.pullDomainEvents(),
      idempotency: {
        operatorId: "user-1",
        key: "idem-1",
        payload: { request: "one" },
      },
    });

    const replay = await repository.findIdempotentResult({
      tenantId: "tenant_test",
      operatorId: "user-1",
      key: "idem-1",
      payload: { request: "one" },
    });
    expect(replay?.id).toBe("leave_transaction_001");
    expect(repository.getAuditRecords()).toHaveLength(1);
    await expect(
      repository.findIdempotentResult({
        tenantId: "tenant_test",
        operatorId: "user-1",
        key: "idem-1",
        payload: { request: "different" },
      }),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REUSED" });

    request.approve({
      approverId: "EMP-MANAGER",
      approvedAt: new Date("2026-06-28T05:00:00.000Z"),
    });
    await repository.commit({
      tenantId: "tenant_test",
      actorId: "user-manager",
      correlationId: "correlation-2",
      action: "LeaveRequestApproved",
      occurredAt: new Date("2026-06-28T05:00:00.000Z"),
      request,
      domainEvents: request.pullDomainEvents(),
    });
    expect(repository.getOutboxEvents()).toEqual([
      expect.objectContaining({ eventType: "leave.request.approved" }),
    ]);
  });
});
