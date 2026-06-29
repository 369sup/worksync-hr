import type { LeaveRequest } from "../aggregates/leave-request";
import type { LeaveRequestId } from "../value-objects/leave-request-id";

export interface LeaveRequestRepository {
  save(tenantId: string, request: LeaveRequest): Promise<void>;
  findById(tenantId: string, id: LeaveRequestId): Promise<LeaveRequest | null>;
  hasOverlap(input: {
    tenantId: string;
    employeeId: string;
    startAt: Date;
    endAt: Date;
  }): Promise<boolean>;
}
