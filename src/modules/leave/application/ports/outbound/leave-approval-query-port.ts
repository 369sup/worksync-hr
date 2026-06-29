export interface LeaveApproverSnapshot {
  readonly tenantId: string;
  readonly employeeId: string;
  readonly approverId: string;
  readonly source: "manager" | "delegate" | "hr";
  readonly routeCode: string;
  readonly validFrom: string;
  readonly validUntil: string | null;
}

export interface LeaveApprovalQueryPort {
  resolveApprover(input: {
    readonly tenantId: string;
    readonly employeeId: string;
    readonly requestedAt: string;
  }): Promise<LeaveApproverSnapshot | null>;
}
