export interface ApprovalAssignmentResult {
  readonly tenantId: string;
  readonly assignmentId: string;
  readonly targetRef: {
    readonly context: "Leave";
    readonly type: "LeaveRequest";
    readonly id: string;
  };
  readonly approverMembershipId: string;
  readonly delegateMembershipId: string | null;
  readonly status: "assigned" | "delegated";
  readonly validUntil: string | null;
  readonly version: number;
}

export interface ApprovalAssignmentQueryPort {
  resolveApprovalAssignment(input: {
    readonly tenantId: string;
    readonly leaveRequestId: string;
    readonly requestedAt: string;
  }): Promise<ApprovalAssignmentResult | null>;
}
