export interface OrganizationTeamScope {
  readonly tenantId: string;
  readonly managerMembershipId: string;
  readonly employeeIds: readonly string[];
}

export interface OrganizationTeamScopeQueryPort {
  getManagedEmployeeIds(input: {
    readonly tenantId: string;
    readonly managerMembershipId: string;
    readonly effectiveAt: string;
  }): Promise<OrganizationTeamScope>;
}
