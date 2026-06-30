import { describe, expect, it } from "vitest";

import { LeaveRequest } from "./leave-request";
import { LeaveRequestId } from "../value-objects/leave-request-id";

const submittedAt = new Date("2026-06-28T01:00:00.000Z");

function submitRequest() {
  return LeaveRequest.submit({
    tenantId: "tenant_test",
    id: LeaveRequestId.create("leave-test"),
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
        id: LeaveRequestId.create("leave-invalid-period"),
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
        approverMembershipId: "MEM-002",
        approverEmployeeId: "EMP-002",
        approvedAt: new Date("2026-06-29T02:00:00.000Z"),
      }),
    ).toThrow("Only pending leave requests can be approved.");
  });

  it("approves only through a different employee and records the fact", () => {
    const request = submitRequest();
    request.pullDomainEvents();

    request.approve({
      approverMembershipId: "MEM-002",
      approverEmployeeId: "EMP-002",
      approvedAt: new Date("2026-06-29T02:00:00.000Z"),
    });

    expect(request.toSnapshot()).toMatchObject({
      status: "approved",
      approverMembershipId: "MEM-002",
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
        approverMembershipId: "MEM-001",
        approverEmployeeId: "EMP-001",
        approvedAt: new Date("2026-06-29T02:00:00.000Z"),
      }),
    ).toThrow("An employee cannot approve or reject their own leave request.");
  });

  it("requires a rejection reason and records the rejected state", () => {
    const request = submitRequest();

    expect(() =>
      request.reject({
        approverMembershipId: "MEM-002",
        approverEmployeeId: "EMP-002",
        rejectedAt: new Date("2026-06-29T02:00:00.000Z"),
        rejectionReason: " ",
      }),
    ).toThrow("Rejection reason is required.");

    request.reject({
      approverMembershipId: "MEM-002",
      approverEmployeeId: "EMP-002",
      rejectedAt: new Date("2026-06-29T02:00:00.000Z"),
      rejectionReason: "Insufficient staffing",
    });
    expect(request.toSnapshot()).toMatchObject({
      status: "rejected",
      rejectionReason: "Insufficient staffing",
      version: 1,
    });
  });

  it("cancels a pending request only once", () => {
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
    ).toThrow("Only pending or approved leave requests can be cancelled.");
  });

  it("records cancellation after approval as a distinct state", () => {
    const request = submitRequest();
    request.approve({
      approverMembershipId: "MEM-002",
      approverEmployeeId: "EMP-002",
      approvedAt: new Date("2026-06-29T02:00:00.000Z"),
    });

    request.cancel({
      cancelledBy: "EMP-001",
      cancelledAt: new Date("2026-06-30T02:00:00.000Z"),
    });

    expect(request.toSnapshot().status).toBe("cancelled-after-approval");
  });
});
