import { describe, expect, it } from "vitest";

import type { LeaveRequestSnapshot } from "../../domain/aggregates/leave-request";
import { toLeaveIntegrationEvent } from "./leave-integration-event";

const request: LeaveRequestSnapshot = {
  tenantId: "tenant_test",
  id: "leave_1",
  employeeId: "EMP-001",
  leaveTypeId: "LT-001",
  leaveTypeCode: "annual-leave",
  startAt: "2026-07-01T01:00:00.000Z",
  endAt: "2026-07-01T09:00:00.000Z",
  reason: "Family appointment",
  status: "approved",
  submittedAt: "2026-06-28T01:00:00.000Z",
  approverId: "EMP-002",
  approvedAt: "2026-06-28T02:00:00.000Z",
  rejectedAt: null,
  rejectionReason: null,
  cancelledBy: null,
  cancelledAt: null,
  overrideReason: null,
  version: 1,
};

describe("Leave Published Language", () => {
  it("maps approval to the versioned public contract", () => {
    const event = toLeaveIntegrationEvent({
      event: {
        eventType: "LeaveRequestApproved",
        tenantId: "tenant_test",
        leaveRequestId: "leave_1",
        approverId: "EMP-002",
        approvedAt: "2026-06-28T02:00:00.000Z",
      },
      request,
      eventId: "event-1",
      correlationId: "correlation-1",
    });

    expect(event).toEqual({
      eventId: "event-1",
      eventType: "leave.request.approved",
      eventVersion: 1,
      occurredAt: "2026-06-28T02:00:00.000Z",
      tenantId: "tenant_test",
      correlationId: "correlation-1",
      payload: {
        leaveRequestId: "leave_1",
        employeeId: "EMP-001",
        leaveTypeId: "LT-001",
        leaveTypeCode: "annual-leave",
        startAt: "2026-07-01T01:00:00.000Z",
        endAt: "2026-07-01T09:00:00.000Z",
        approvedBy: "EMP-002",
        approvedAt: "2026-06-28T02:00:00.000Z",
      },
    });
  });
});
