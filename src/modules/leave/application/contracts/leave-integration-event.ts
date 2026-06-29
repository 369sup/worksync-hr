import type { IntegrationEventMetadata } from "@/shared/types/integration-event";

import type { LeaveRequestSnapshot } from "../../domain/aggregates/leave-request";
import type { LeaveRequestEvent } from "../../domain/events/leave-request-event";

export type LeaveApprovedIntegrationEvent = IntegrationEventMetadata & {
  readonly eventType: "leave.request.approved";
  readonly eventVersion: 1;
  readonly payload: {
    readonly leaveRequestId: string;
    readonly employeeId: string;
    readonly leaveTypeId: string;
    readonly leaveTypeCode: string;
    readonly startAt: string;
    readonly endAt: string;
    readonly approvedBy: string;
    readonly approvedAt: string;
  };
};

export type LeaveRejectedIntegrationEvent = IntegrationEventMetadata & {
  readonly eventType: "leave.request.rejected";
  readonly eventVersion: 1;
  readonly payload: {
    readonly leaveRequestId: string;
    readonly employeeId: string;
    readonly rejectedBy: string;
    readonly rejectedAt: string;
    readonly rejectionReason: string;
  };
};

export type LeaveCancelledIntegrationEvent = IntegrationEventMetadata & {
  readonly eventType: "leave.request.cancelled";
  readonly eventVersion: 1;
  readonly payload: {
    readonly leaveRequestId: string;
    readonly employeeId: string;
    readonly cancelledBy: string;
    readonly cancelledAt: string;
  };
};

type PublishedLeaveEvent = Exclude<
  LeaveRequestEvent,
  { readonly eventType: "LeaveRequestSubmitted" }
>;

export function toLeaveIntegrationEvent(input: {
  readonly event: PublishedLeaveEvent;
  readonly request: LeaveRequestSnapshot;
  readonly eventId: string;
  readonly correlationId: string;
  readonly causationId?: string;
}):
  | LeaveApprovedIntegrationEvent
  | LeaveRejectedIntegrationEvent
  | LeaveCancelledIntegrationEvent {
  const metadata = {
    eventId: input.eventId,
    eventVersion: 1 as const,
    occurredAt:
      input.event.eventType === "LeaveRequestApproved"
        ? input.event.approvedAt
        : input.event.eventType === "LeaveRequestRejected"
          ? input.event.rejectedAt
          : input.event.cancelledAt,
    tenantId: input.event.tenantId,
    correlationId: input.correlationId,
    ...(input.causationId ? { causationId: input.causationId } : {}),
  };

  switch (input.event.eventType) {
    case "LeaveRequestApproved":
      return {
        ...metadata,
        eventType: "leave.request.approved",
        payload: {
          leaveRequestId: input.request.id,
          employeeId: input.request.employeeId,
          leaveTypeId: input.request.leaveTypeId,
          leaveTypeCode: input.request.leaveTypeCode,
          startAt: input.request.startAt,
          endAt: input.request.endAt,
          approvedBy: input.event.approverId,
          approvedAt: input.event.approvedAt,
        },
      };
    case "LeaveRequestRejected":
      return {
        ...metadata,
        eventType: "leave.request.rejected",
        payload: {
          leaveRequestId: input.request.id,
          employeeId: input.request.employeeId,
          rejectedBy: input.event.approverId,
          rejectedAt: input.event.rejectedAt,
          rejectionReason: input.event.rejectionReason,
        },
      };
    case "LeaveRequestCancelled":
      return {
        ...metadata,
        eventType: "leave.request.cancelled",
        payload: {
          leaveRequestId: input.request.id,
          employeeId: input.request.employeeId,
          cancelledBy: input.event.cancelledBy,
          cancelledAt: input.event.cancelledAt,
        },
      };
  }
}
