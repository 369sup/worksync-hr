export interface EmployeeLeaveSnapshot {
  readonly tenantId: string;
  readonly employeeId: string;
  readonly employmentStatus: "active" | "inactive" | "suspended";
  readonly departmentId: string | null;
  readonly managerId: string | null;
  readonly timezone: string;
  readonly assignedCalendarId: string | null;
  readonly hiredAt: string;
  readonly terminatedAt: string | null;
}

export interface EmployeeLeaveProfileQueryPort {
  getEmployeeLeaveSnapshot(input: {
    readonly tenantId: string;
    readonly employeeId: string;
    readonly effectiveAt: string;
  }): Promise<EmployeeLeaveSnapshot | null>;
}
