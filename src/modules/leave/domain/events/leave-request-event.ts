export type LeaveRequestEvent =
  | {
      readonly eventType: "LeaveRequestSubmitted";
      readonly tenantId: string;
      readonly leaveRequestId: string;
      readonly employeeId: string;
      readonly leaveTypeId: string;
      readonly leaveTypeCode: string;
      readonly startAt: string;
      readonly endAt: string;
      readonly submittedAt: string;
    }
  | {
      readonly eventType: "LeaveRequestApproved";
      readonly tenantId: string;
      readonly leaveRequestId: string;
      readonly approverMembershipId: string;
      readonly approvedAt: string;
    }
  | {
      readonly eventType: "LeaveRequestRejected";
      readonly tenantId: string;
      readonly leaveRequestId: string;
      readonly approverMembershipId: string;
      readonly rejectionReason: string;
      readonly rejectedAt: string;
    }
  | {
      readonly eventType: "LeaveRequestCancelled";
      readonly tenantId: string;
      readonly leaveRequestId: string;
      readonly cancelledBy: string;
      readonly cancelledAt: string;
      readonly overrideReason?: string;
    };
