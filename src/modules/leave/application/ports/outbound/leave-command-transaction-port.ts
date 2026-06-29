import type {
  LeaveRequest,
  LeaveRequestSnapshot,
} from "../../../domain/aggregates/leave-request";
import type { LeaveRequestEvent } from "../../../domain/events/leave-request-event";

export type LeaveAuditAction =
  | "LeaveRequestSubmitted"
  | "LeaveRequestApproved"
  | "LeaveRequestRejected"
  | "LeaveRequestCancelled";

export interface LeaveIdempotencyInput {
  readonly tenantId: string;
  readonly operatorId: string;
  readonly key: string;
  readonly payload: Readonly<Record<string, string>>;
}

export interface LeaveCommandTransactionPort {
  findIdempotentResult(
    input: LeaveIdempotencyInput,
  ): Promise<LeaveRequestSnapshot | null>;

  commit(input: {
    readonly tenantId: string;
    readonly actorId: string;
    readonly correlationId: string;
    readonly action: LeaveAuditAction;
    readonly occurredAt: Date;
    readonly auditReason?: string;
    readonly request: LeaveRequest;
    readonly domainEvents: readonly LeaveRequestEvent[];
    readonly idempotency?: Omit<LeaveIdempotencyInput, "tenantId">;
  }): Promise<LeaveRequestSnapshot>;
}
