import type {
  LeaveRequestDetail,
  LeaveRequestPage,
  LeaveRequestSearchCriteria,
} from "../../query-models/leave-request-list-item";

export type LeaveRequestVisibilityScope =
  | { readonly kind: "tenant" }
  | { readonly kind: "employees"; readonly employeeIds: readonly string[] };

export interface LeaveRequestQueryPort {
  getDetail(input: {
    tenantId: string;
    leaveRequestId: string;
    visibility: LeaveRequestVisibilityScope;
    includeSensitive: boolean;
  }): Promise<LeaveRequestDetail | null>;
  search(input: {
    tenantId: string;
    visibility: LeaveRequestVisibilityScope;
    criteria: LeaveRequestSearchCriteria;
  }): Promise<LeaveRequestPage>;
}
