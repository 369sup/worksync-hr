import type { LeaveRequestEvent } from "../events/leave-request-event";
import {
  InvalidLeavePeriodError,
  LeaveReasonRequiredError,
  LeaveRequestCannotBeApprovedError,
  LeaveRequestCannotBeCancelledError,
  LeaveRequestCannotBeRejectedError,
  RejectionReasonRequiredError,
  SelfApprovalForbiddenError,
} from "../errors/leave-domain-error";
import { LeaveRequestId } from "../value-objects/leave-request-id";

export type LeaveRequestStatus =
  "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequestSnapshot {
  tenantId: string;
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  startAt: string;
  endAt: string;
  reason: string;
  status: LeaveRequestStatus;
  submittedAt: string;
  approverId: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  overrideReason: string | null;
  version: number;
}

export class LeaveRequest {
  private readonly domainEvents: LeaveRequestEvent[] = [];

  private constructor(private readonly snapshot: LeaveRequestSnapshot) {}

  static submit(input: {
    tenantId: string;
    id?: LeaveRequestId;
    employeeId: string;
    leaveTypeId: string;
    leaveTypeCode: string;
    startAt: Date;
    endAt: Date;
    reason: string;
    submittedAt: Date;
  }) {
    if (input.endAt <= input.startAt) throw new InvalidLeavePeriodError();

    const reason = input.reason.trim();
    if (!reason) throw new LeaveReasonRequiredError();

    const request = new LeaveRequest({
      tenantId: input.tenantId,
      id: (input.id ?? LeaveRequestId.generate()).value,
      employeeId: input.employeeId,
      leaveTypeId: input.leaveTypeId,
      leaveTypeCode: input.leaveTypeCode,
      startAt: input.startAt.toISOString(),
      endAt: input.endAt.toISOString(),
      reason,
      status: "pending",
      submittedAt: input.submittedAt.toISOString(),
      approverId: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      cancelledBy: null,
      cancelledAt: null,
      overrideReason: null,
      version: 0,
    });

    request.domainEvents.push({
      eventType: "LeaveRequestSubmitted",
      tenantId: input.tenantId,
      leaveRequestId: request.snapshot.id,
      employeeId: input.employeeId,
      leaveTypeId: input.leaveTypeId,
      leaveTypeCode: input.leaveTypeCode,
      startAt: request.snapshot.startAt,
      endAt: request.snapshot.endAt,
      submittedAt: request.snapshot.submittedAt,
    });
    return request;
  }

  static fromSnapshot(snapshot: LeaveRequestSnapshot) {
    return new LeaveRequest({ ...snapshot });
  }

  approve(input: { approverId: string; approvedAt: Date }) {
    if (this.snapshot.status !== "pending")
      throw new LeaveRequestCannotBeApprovedError();
    if (input.approverId === this.snapshot.employeeId)
      throw new SelfApprovalForbiddenError();

    this.snapshot.status = "approved";
    this.snapshot.approverId = input.approverId;
    this.snapshot.approvedAt = input.approvedAt.toISOString();
    this.snapshot.version += 1;
    this.domainEvents.push({
      eventType: "LeaveRequestApproved",
      tenantId: this.snapshot.tenantId,
      leaveRequestId: this.snapshot.id,
      approverId: input.approverId,
      approvedAt: this.snapshot.approvedAt,
    });
  }

  reject(input: {
    approverId: string;
    rejectedAt: Date;
    rejectionReason: string;
  }) {
    if (this.snapshot.status !== "pending")
      throw new LeaveRequestCannotBeRejectedError();
    if (input.approverId === this.snapshot.employeeId)
      throw new SelfApprovalForbiddenError();

    const rejectionReason = input.rejectionReason.trim();
    if (!rejectionReason) throw new RejectionReasonRequiredError();

    this.snapshot.status = "rejected";
    this.snapshot.approverId = input.approverId;
    this.snapshot.rejectedAt = input.rejectedAt.toISOString();
    this.snapshot.rejectionReason = rejectionReason;
    this.snapshot.version += 1;
    this.domainEvents.push({
      eventType: "LeaveRequestRejected",
      tenantId: this.snapshot.tenantId,
      leaveRequestId: this.snapshot.id,
      approverId: input.approverId,
      rejectionReason,
      rejectedAt: this.snapshot.rejectedAt,
    });
  }

  cancel(input: {
    cancelledBy: string;
    cancelledAt: Date;
    overrideReason?: string;
  }) {
    if (this.snapshot.status !== "pending")
      throw new LeaveRequestCannotBeCancelledError();

    this.snapshot.status = "cancelled";
    this.snapshot.cancelledBy = input.cancelledBy;
    this.snapshot.cancelledAt = input.cancelledAt.toISOString();
    this.snapshot.overrideReason = input.overrideReason?.trim() || null;
    this.snapshot.version += 1;
    this.domainEvents.push({
      eventType: "LeaveRequestCancelled",
      tenantId: this.snapshot.tenantId,
      leaveRequestId: this.snapshot.id,
      cancelledBy: input.cancelledBy,
      cancelledAt: this.snapshot.cancelledAt,
      ...(this.snapshot.overrideReason
        ? { overrideReason: this.snapshot.overrideReason }
        : {}),
    });
  }

  toSnapshot(): LeaveRequestSnapshot {
    return { ...this.snapshot };
  }

  pullDomainEvents(): readonly LeaveRequestEvent[] {
    return this.domainEvents.splice(0);
  }
}
