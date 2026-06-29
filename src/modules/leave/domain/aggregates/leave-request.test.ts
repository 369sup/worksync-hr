import { describe, expect, it } from "vitest";

import { LeaveRequest } from "./leave-request";

const submittedAt = new Date("2026-06-28T01:00:00.000Z");

function submitRequest() {
  return LeaveRequest.submit({
    tenantId: "tenant_test",
    employeeId: "EMP-001",
    leaveTypeId: "LT-001",
    leaveTypeCode: "annual-leave",
    startAt: new Date("2026-07-01T01:00:00.000Z"),
    endAt: new Date("2026-07-01T09:00:00.000Z"),
    reason: "Family appointment",
    submittedAt,
  });
}

describe("LeaveRequest", () => {
  it("creates a pending request with a stable snapshot", () => {
    const request = submitRequest();

    expect(request.toSnapshot()).toMatchObject({
      employeeId: "EMP-001",
      leaveTypeId: "LT-001",
      leaveTypeCode: "annual-leave",
      status: "pending",
      submittedAt: submittedAt.toISOString(),
    });
  });

  it("rejects a period that does not end after it starts", () => {
    expect(() =>
      LeaveRequest.submit({
        tenantId: "tenant_test",
        employeeId: "EMP-001",
        leaveTypeId: "LT-001",
        leaveTypeCode: "annual-leave",
        startAt: new Date("2026-07-01T09:00:00.000Z"),
        endAt: new Date("2026-07-01T09:00:00.000Z"),
        reason: "Family appointment",
        submittedAt,
      }),
    ).toThrow("Leave period must end after it starts.");
  });

  it("does not approve an already processed request", () => {
    const request = submitRequest();
    request.cancel({
      cancelledBy: "EMP-001",
      cancelledAt: new Date("2026-06-29T01:00:00.000Z"),
    });

    expect(() =>
      request.approve({
        approverId: "EMP-002",
        approvedAt: new Date("2026-06-29T02:00:00.000Z"),
      }),
    ).toThrow("Only pending leave requests can be approved.");
  });

  it("approves only through a different employee and records the fact", () => {
    const request = submitRequest();
    request.pullDomainEvents();

    request.approve({
      approverId: "EMP-002",
      approvedAt: new Date("2026-06-29T02:00:00.000Z"),
    });

    expect(request.toSnapshot()).toMatchObject({
      status: "approved",
      approverId: "EMP-002",
      version: 1,
    });
    expect(request.pullDomainEvents()).toEqual([
      expect.objectContaining({ eventType: "LeaveRequestApproved" }),
    ]);
  });

  it("rejects self approval", () => {
    const request = submitRequest();

    expect(() =>
      request.approve({
        approverId: "EMP-001",
        approvedAt: new Date("2026-06-29T02:00:00.000Z"),
      }),
    ).toThrow("An employee cannot approve or reject their own leave request.");
  });

  it("requires a rejection reason and records the rejected state", () => {
    const request = submitRequest();

    expect(() =>
      request.reject({
        approverId: "EMP-002",
        rejectedAt: new Date("2026-06-29T02:00:00.000Z"),
        rejectionReason: " ",
      }),
    ).toThrow("Rejection reason is required.");

    request.reject({
      approverId: "EMP-002",
      rejectedAt: new Date("2026-06-29T02:00:00.000Z"),
      rejectionReason: "Insufficient staffing",
    });
    expect(request.toSnapshot()).toMatchObject({
      status: "rejected",
      rejectionReason: "Insufficient staffing",
      version: 1,
    });
  });

  it("cancels only a pending request", () => {
    const request = submitRequest();
    request.cancel({
      cancelledBy: "EMP-001",
      cancelledAt: new Date("2026-06-29T01:00:00.000Z"),
    });

    expect(request.toSnapshot()).toMatchObject({
      status: "cancelled",
      cancelledBy: "EMP-001",
      version: 1,
    });
    expect(() =>
      request.cancel({
        cancelledBy: "EMP-001",
        cancelledAt: new Date("2026-06-29T02:00:00.000Z"),
      }),
    ).toThrow("Only pending leave requests can be cancelled.");
  });
});
