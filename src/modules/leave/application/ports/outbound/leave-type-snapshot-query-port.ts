export interface LeaveTypeSnapshot {
  readonly tenantId: string;
  readonly leaveTypeId: string;
  readonly code: string;
  readonly status: "active" | "inactive";
  readonly version: number;
}

export interface LeaveTypeSnapshotQueryPort {
  getLeaveTypeSnapshot(input: {
    readonly tenantId: string;
    readonly leaveTypeId: string;
    readonly effectiveAt: string;
  }): Promise<LeaveTypeSnapshot | null>;
}
