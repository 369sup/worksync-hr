import {
  LeaveRequest,
  type LeaveRequestSnapshot,
} from "../../domain/aggregates/leave-request";
import { LeaveApplicationError } from "../../application/errors/leave-application-error";
import type {
  LeaveAuditAction,
  LeaveCommandTransactionPort,
} from "../../application/ports/outbound/leave-command-transaction-port";
import type { LeaveRequestQueryPort } from "../../application/ports/outbound/leave-request-query-port";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { LeaveRequestId } from "../../domain/value-objects/leave-request-id";

const seedData: LeaveRequestSnapshot[] = [
  {
    tenantId: "tenant_demo",
    id: "leave_seed_001",
    employeeId: "EMP-001",
    leaveTypeId: "LT-001",
    leaveTypeCode: "annual-leave",
    startAt: "2026-07-10T01:00:00.000Z",
    endAt: "2026-07-11T09:00:00.000Z",
    reason: "Family trip planning",
    status: "pending",
    submittedAt: "2026-06-26T08:00:00.000Z",
    approverMembershipId: null,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    cancelledBy: null,
    cancelledAt: null,
    overrideReason: null,
    version: 0,
  },
  {
    tenantId: "tenant_demo",
    id: "leave_seed_002",
    employeeId: "EMP-014",
    leaveTypeId: "LT-002",
    leaveTypeCode: "sick-leave",
    startAt: "2026-06-28T00:00:00.000Z",
    endAt: "2026-06-28T04:00:00.000Z",
    reason: "Medical appointment follow-up",
    status: "approved",
    submittedAt: "2026-06-25T03:30:00.000Z",
    approverMembershipId: "MEM-002",
    approvedAt: "2026-06-25T04:15:00.000Z",
    rejectedAt: null,
    rejectionReason: null,
    cancelledBy: null,
    cancelledAt: null,
    overrideReason: null,
    version: 1,
  },
];

function key(tenantId: string, leaveRequestId: string) {
  return `${tenantId}:${leaveRequestId}`;
}

export class InMemoryLeaveRequestRepository
  implements
    LeaveRequestRepository,
    LeaveRequestQueryPort,
    LeaveCommandTransactionPort
{
  private readonly items = new Map<string, LeaveRequestSnapshot>(
    seedData.map((item) => [key(item.tenantId, item.id), { ...item }]),
  );
  private readonly idempotency = new Map<
    string,
    { fingerprint: string; leaveRequestId: string }
  >();
  private readonly audits: {
    tenantId: string;
    actorId: string;
    action: LeaveAuditAction;
    targetId: string;
    occurredAt: string;
    requestId: string;
    requestSource: "ui" | "api" | "system" | "batch";
    reason?: string;
  }[] = [];

  async save(tenantId: string, request: LeaveRequest) {
    const snapshot = request.toSnapshot();
    if (snapshot.tenantId !== tenantId)
      throw new Error("Repository tenant mismatch.");
    this.items.set(key(tenantId, snapshot.id), snapshot);
  }

  async findById(tenantId: string, id: LeaveRequestId) {
    const snapshot = this.items.get(key(tenantId, id.value));
    return snapshot ? LeaveRequest.fromSnapshot(snapshot) : null;
  }

  async hasOverlap(input: {
    tenantId: string;
    employeeId: string;
    startAt: Date;
    endAt: Date;
  }) {
    return Array.from(this.items.values()).some(
      (item) =>
        item.tenantId === input.tenantId &&
        item.employeeId === input.employeeId &&
        (item.status === "pending" || item.status === "approved") &&
        new Date(item.startAt) < input.endAt &&
        new Date(item.endAt) > input.startAt,
    );
  }

  async list(tenantId: string) {
    const page = await this.search({
      tenantId,
      visibility: { kind: "tenant" },
      criteria: { page: 1, pageSize: 100 },
    });
    return page.items;
  }

  async getDetail(input: {
    tenantId: string;
    leaveRequestId: string;
    visibility:
      | { readonly kind: "tenant" }
      | { readonly kind: "employees"; readonly employeeIds: readonly string[] };
    includeSensitive: boolean;
  }) {
    const item = this.items.get(key(input.tenantId, input.leaveRequestId));
    if (!item || !isVisible(item, input.visibility)) return null;
    return toDetail(item, input.includeSensitive);
  }

  async search(input: {
    tenantId: string;
    visibility:
      | { readonly kind: "tenant" }
      | { readonly kind: "employees"; readonly employeeIds: readonly string[] };
    criteria: {
      status?: LeaveRequestSnapshot["status"];
      employeeId?: string;
      periodStart?: Date;
      periodEnd?: Date;
      page: number;
      pageSize: number;
    };
  }) {
    const filtered = Array.from(this.items.values())
      .filter((item) => item.tenantId === input.tenantId)
      .filter((item) => isVisible(item, input.visibility))
      .filter(
        (item) =>
          !input.criteria.status || item.status === input.criteria.status,
      )
      .filter(
        (item) =>
          !input.criteria.employeeId ||
          item.employeeId === input.criteria.employeeId,
      )
      .filter(
        (item) =>
          !input.criteria.periodStart ||
          new Date(item.endAt) > input.criteria.periodStart,
      )
      .filter(
        (item) =>
          !input.criteria.periodEnd ||
          new Date(item.startAt) < input.criteria.periodEnd,
      )
      .sort(
        (left, right) =>
          right.submittedAt.localeCompare(left.submittedAt) ||
          right.id.localeCompare(left.id),
      );
    const offset = (input.criteria.page - 1) * input.criteria.pageSize;
    const items = filtered
      .slice(offset, offset + input.criteria.pageSize)
      .map(toListItem);
    return {
      items,
      page: input.criteria.page,
      pageSize: input.criteria.pageSize,
      hasNext: filtered.length > offset + items.length,
    };
  }

  async findIdempotentResult(input: {
    tenantId: string;
    operatorId: string;
    key: string;
    payload: Readonly<Record<string, string>>;
  }) {
    const existing = this.idempotency.get(
      `${input.tenantId}:${input.operatorId}:${input.key}`,
    );
    if (!existing) return null;
    const fingerprint = JSON.stringify(input.payload);
    if (existing.fingerprint !== fingerprint) {
      throw new LeaveApplicationError(
        "IDEMPOTENCY_KEY_REUSED",
        "Idempotency key was reused with a different request.",
      );
    }
    const snapshot = this.items.get(
      key(input.tenantId, existing.leaveRequestId),
    );
    if (!snapshot) throw new Error("Idempotency result is missing.");
    return { ...snapshot };
  }

  async commit(input: Parameters<LeaveCommandTransactionPort["commit"]>[0]) {
    const idempotencyKey = input.idempotency
      ? `${input.tenantId}:${input.idempotency.operatorId}:${input.idempotency.key}`
      : undefined;
    const fingerprint = input.idempotency
      ? JSON.stringify(input.idempotency.payload)
      : undefined;
    if (idempotencyKey && fingerprint) {
      const existing = this.idempotency.get(idempotencyKey);
      if (existing) {
        if (existing.fingerprint !== fingerprint) {
          throw new LeaveApplicationError(
            "IDEMPOTENCY_KEY_REUSED",
            "Idempotency key was reused with a different request.",
          );
        }
        const snapshot = this.items.get(
          key(input.tenantId, existing.leaveRequestId),
        );
        if (!snapshot) throw new Error("Idempotency result is missing.");
        return { ...snapshot };
      }
    }

    await this.save(input.tenantId, input.request);
    const snapshot = input.request.toSnapshot();
    if (idempotencyKey && fingerprint) {
      this.idempotency.set(idempotencyKey, {
        fingerprint,
        leaveRequestId: snapshot.id,
      });
    }
    this.audits.push({
      tenantId: input.tenantId,
      actorId: input.actor.userId,
      action: input.action,
      targetId: snapshot.id,
      occurredAt: input.occurredAt.toISOString(),
      requestId: input.actor.requestId,
      requestSource: input.actor.requestSource,
      ...(input.auditReason ? { reason: input.auditReason } : {}),
    });
    return snapshot;
  }

  getAuditRecords() {
    return this.audits.map((record) => ({ ...record }));
  }

}

function isVisible(
  item: LeaveRequestSnapshot,
  visibility:
    | { readonly kind: "tenant" }
    | { readonly kind: "employees"; readonly employeeIds: readonly string[] },
) {
  return (
    visibility.kind === "tenant" ||
    visibility.employeeIds.includes(item.employeeId)
  );
}

function toListItem(item: LeaveRequestSnapshot) {
  return {
    id: item.id,
    employeeId: item.employeeId,
    leaveTypeCode: item.leaveTypeCode,
    startAt: item.startAt,
    endAt: item.endAt,
    status: item.status,
    submittedAt: item.submittedAt,
  };
}

function toDetail(item: LeaveRequestSnapshot, includeSensitive: boolean) {
  return {
    ...toListItem(item),
    leaveTypeId: item.leaveTypeId,
    reason: includeSensitive ? item.reason : null,
    approverMembershipId: item.approverMembershipId,
    approvedAt: item.approvedAt,
    rejectedAt: item.rejectedAt,
    rejectionReason: includeSensitive ? item.rejectionReason : null,
    cancelledBy: item.cancelledBy,
    cancelledAt: item.cancelledAt,
  };
}
