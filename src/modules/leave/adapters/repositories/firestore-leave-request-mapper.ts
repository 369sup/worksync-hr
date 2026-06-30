import {
  Timestamp,
  type DocumentData,
} from "firebase-admin/firestore";

import {
  LeaveRequest,
  type LeaveRequestSnapshot,
  type LeaveRequestStatus,
} from "../../domain/aggregates/leave-request";

export interface LeaveRequestDocument {
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  startAt: Timestamp;
  endAt: Timestamp;
  reason: string;
  status: LeaveRequestStatus;
  submittedAt: Timestamp;
  approverMembershipId: string | null;
  approvedAt: Timestamp | null;
  rejectedAt: Timestamp | null;
  rejectionReason: string | null;
  cancelledBy: string | null;
  cancelledAt: Timestamp | null;
  overrideReason: string | null;
  version: number;
  updatedAt: Timestamp;
}

function timestamp(value: unknown, field: string): Timestamp {
  if (!(value instanceof Timestamp)) {
    throw new Error(`Invalid LeaveRequest document ${field}.`);
  }
  return value;
}

function nullableTimestamp(value: unknown, field: string): Timestamp | null {
  return value === null ? null : timestamp(value, field);
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new Error(`Invalid LeaveRequest document ${field}.`);
  }
  return value;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid LeaveRequest document ${field}.`);
  }
  return value;
}

function status(value: unknown): LeaveRequestStatus {
  if (
    ![
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "cancelled-after-approval",
    ].includes(String(value))
  ) {
    throw new Error("Invalid LeaveRequest document status.");
  }
  return value as LeaveRequestStatus;
}

export function toLeaveRequestDocument(
  snapshot: LeaveRequestSnapshot,
): LeaveRequestDocument {
  return {
    tenantId: snapshot.tenantId,
    employeeId: snapshot.employeeId,
    leaveTypeId: snapshot.leaveTypeId,
    leaveTypeCode: snapshot.leaveTypeCode,
    startAt: Timestamp.fromDate(new Date(snapshot.startAt)),
    endAt: Timestamp.fromDate(new Date(snapshot.endAt)),
    reason: snapshot.reason,
    status: snapshot.status,
    submittedAt: Timestamp.fromDate(new Date(snapshot.submittedAt)),
    approverMembershipId: snapshot.approverMembershipId,
    approvedAt: snapshot.approvedAt
      ? Timestamp.fromDate(new Date(snapshot.approvedAt))
      : null,
    rejectedAt: snapshot.rejectedAt
      ? Timestamp.fromDate(new Date(snapshot.rejectedAt))
      : null,
    rejectionReason: snapshot.rejectionReason,
    cancelledBy: snapshot.cancelledBy,
    cancelledAt: snapshot.cancelledAt
      ? Timestamp.fromDate(new Date(snapshot.cancelledAt))
      : null,
    overrideReason: snapshot.overrideReason,
    version: snapshot.version,
    updatedAt: Timestamp.now(),
  };
}

export function toLeaveRequest(
  tenantId: string,
  leaveRequestId: string,
  data: DocumentData,
) {
  if (data.tenantId !== tenantId) {
    throw new Error("LeaveRequest document tenant mismatch.");
  }
  const version = data.version;
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("Invalid LeaveRequest document version.");
  }
  return LeaveRequest.fromSnapshot({
    tenantId,
    id: leaveRequestId,
    employeeId: requiredString(data.employeeId, "employeeId"),
    leaveTypeId: requiredString(data.leaveTypeId, "leaveTypeId"),
    leaveTypeCode: requiredString(data.leaveTypeCode, "leaveTypeCode"),
    startAt: timestamp(data.startAt, "startAt").toDate().toISOString(),
    endAt: timestamp(data.endAt, "endAt").toDate().toISOString(),
    reason: requiredString(data.reason, "reason"),
    status: status(data.status),
    submittedAt: timestamp(data.submittedAt, "submittedAt")
      .toDate()
      .toISOString(),
    approverMembershipId: nullableString(
      data.approverMembershipId,
      "approverMembershipId",
    ),
    approvedAt: nullableTimestamp(data.approvedAt, "approvedAt")
      ?.toDate()
      .toISOString() ?? null,
    rejectedAt: nullableTimestamp(data.rejectedAt, "rejectedAt")
      ?.toDate()
      .toISOString() ?? null,
    rejectionReason: nullableString(data.rejectionReason, "rejectionReason"),
    cancelledBy: nullableString(data.cancelledBy, "cancelledBy"),
    cancelledAt: nullableTimestamp(data.cancelledAt, "cancelledAt")
      ?.toDate()
      .toISOString() ?? null,
    overrideReason: nullableString(data.overrideReason, "overrideReason"),
    version,
  });
}
