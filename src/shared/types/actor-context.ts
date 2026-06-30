export interface ActorContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly employeeId: string | null;
  readonly membershipId: string;
  readonly membershipStatus: "active" | "inactive";
  readonly capabilities: readonly string[];
  readonly scope:
    | { readonly kind: "tenant" }
    | { readonly kind: "self" }
    | {
        readonly kind: "organization-units";
        readonly organizationUnitIds: readonly string[];
      };
  readonly requestId: string;
  readonly requestSource: "ui" | "api" | "system" | "batch";
}
