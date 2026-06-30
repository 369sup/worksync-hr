export interface EmployeeSnapshot {
  readonly tenantId: string;
  readonly employeeId: string;
  readonly status: "active" | "inactive" | "suspended";
  readonly displayName: string;
  readonly version: number;
}

export interface EmployeeSnapshotQueryPort {
  getEmployeeSnapshot(input: {
    readonly tenantId: string;
    readonly employeeId: string;
    readonly effectiveAt: string;
  }): Promise<EmployeeSnapshot | null>;
}
