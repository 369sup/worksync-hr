export interface ActorContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly employeeId: string | null;
  readonly membershipStatus: "active" | "inactive";
  readonly capabilities: readonly string[];
  readonly correlationId: string;
}
