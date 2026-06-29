export interface LeaveVisibilityQueryPort {
  getManagedEmployeeIds(input: {
    readonly tenantId: string;
    readonly managerEmployeeId: string;
    readonly effectiveAt: string;
  }): Promise<{
    readonly tenantId: string;
    readonly employeeIds: readonly string[];
  }>;
}
