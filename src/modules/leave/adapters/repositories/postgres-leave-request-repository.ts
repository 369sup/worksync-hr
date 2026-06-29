import { createHash, randomUUID } from "node:crypto";

import { and, desc, eq, gt, inArray, lt } from "drizzle-orm";

import type { PostgresDatabase } from "@/bootstrap/persistence/postgres";
import {
  auditRecords,
  idempotencyRecords,
  leaveRequests,
  outboxMessages,
} from "@/bootstrap/persistence/schema";

import {
  LeaveRequest,
  type LeaveRequestSnapshot,
} from "../../domain/aggregates/leave-request";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { LeaveRequestId } from "../../domain/value-objects/leave-request-id";
import { toLeaveIntegrationEvent } from "../../application/contracts/leave-integration-event";
import { LeaveApplicationError } from "../../application/errors/leave-application-error";
import type { LeaveCommandTransactionPort } from "../../application/ports/outbound/leave-command-transaction-port";
import type { LeaveRequestQueryPort } from "../../application/ports/outbound/leave-request-query-port";

const activeStatuses = ["pending", "approved"] as const;

function isStatus(value: string): value is LeaveRequestSnapshot["status"] {
  return ["pending", "approved", "rejected", "cancelled"].includes(value);
}

function toDomain(row: typeof leaveRequests.$inferSelect) {
  if (!isStatus(row.status))
    throw new Error("Invalid persisted LeaveRequest status.");

  const snapshot: LeaveRequestSnapshot = {
    tenantId: row.tenantId,
    id: row.leaveRequestId,
    employeeId: row.employeeId,
    leaveTypeId: row.leaveTypeId,
    leaveTypeCode: row.leaveTypeCode,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    reason: row.reason,
    status: row.status,
    submittedAt: row.submittedAt.toISOString(),
    approverId: row.approverId,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    cancelledBy: row.cancelledBy,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    overrideReason: row.overrideReason,
    version: row.version,
  };
  assertPersistedInvariant(snapshot);
  return LeaveRequest.fromSnapshot(snapshot);
}

function assertPersistedInvariant(snapshot: LeaveRequestSnapshot) {
  const hasIdentity = [
    snapshot.tenantId,
    snapshot.id,
    snapshot.employeeId,
    snapshot.leaveTypeId,
    snapshot.leaveTypeCode,
    snapshot.reason,
  ].every((value) => Boolean(value.trim()));
  const periodIsValid =
    Number.isFinite(new Date(snapshot.startAt).getTime()) &&
    Number.isFinite(new Date(snapshot.endAt).getTime()) &&
    new Date(snapshot.endAt) > new Date(snapshot.startAt);
  const stateIsValid =
    (snapshot.status === "pending" &&
      !snapshot.approverId &&
      !snapshot.approvedAt &&
      !snapshot.rejectedAt &&
      !snapshot.rejectionReason &&
      !snapshot.cancelledBy &&
      !snapshot.cancelledAt) ||
    (snapshot.status === "approved" &&
      Boolean(snapshot.approverId && snapshot.approvedAt) &&
      !snapshot.rejectedAt &&
      !snapshot.rejectionReason &&
      !snapshot.cancelledBy &&
      !snapshot.cancelledAt) ||
    (snapshot.status === "rejected" &&
      Boolean(
        snapshot.approverId &&
        snapshot.rejectedAt &&
        snapshot.rejectionReason?.trim(),
      ) &&
      !snapshot.approvedAt &&
      !snapshot.cancelledBy &&
      !snapshot.cancelledAt) ||
    (snapshot.status === "cancelled" &&
      Boolean(snapshot.cancelledBy && snapshot.cancelledAt) &&
      !snapshot.approverId &&
      !snapshot.approvedAt &&
      !snapshot.rejectedAt &&
      !snapshot.rejectionReason);
  if (
    !hasIdentity ||
    !periodIsValid ||
    !stateIsValid ||
    !Number.isInteger(snapshot.version) ||
    snapshot.version < 0
  ) {
    throw new Error("Invalid persisted LeaveRequest invariant.");
  }
}

function toPersistence(snapshot: LeaveRequestSnapshot) {
  return {
    tenantId: snapshot.tenantId,
    leaveRequestId: snapshot.id,
    employeeId: snapshot.employeeId,
    leaveTypeId: snapshot.leaveTypeId,
    leaveTypeCode: snapshot.leaveTypeCode,
    startAt: new Date(snapshot.startAt),
    endAt: new Date(snapshot.endAt),
    reason: snapshot.reason,
    status: snapshot.status,
    submittedAt: new Date(snapshot.submittedAt),
    approverId: snapshot.approverId,
    approvedAt: snapshot.approvedAt ? new Date(snapshot.approvedAt) : null,
    rejectedAt: snapshot.rejectedAt ? new Date(snapshot.rejectedAt) : null,
    rejectionReason: snapshot.rejectionReason,
    cancelledBy: snapshot.cancelledBy,
    cancelledAt: snapshot.cancelledAt ? new Date(snapshot.cancelledAt) : null,
    overrideReason: snapshot.overrideReason,
    version: snapshot.version,
    updatedAt: new Date(),
  };
}

function postgresCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String(error.code)
    : undefined;
}

export class PostgresLeaveRequestRepository
  implements
    LeaveRequestRepository,
    LeaveRequestQueryPort,
    LeaveCommandTransactionPort
{
  constructor(private readonly database: PostgresDatabase) {}

  async save(tenantId: string, request: LeaveRequest) {
    await saveRequest(this.database, tenantId, request);
  }

  async findById(tenantId: string, id: LeaveRequestId) {
    const [row] = await this.database
      .select()
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.tenantId, tenantId),
          eq(leaveRequests.leaveRequestId, id.value),
        ),
      )
      .limit(1);
    return row ? toDomain(row) : null;
  }

  async hasOverlap(input: {
    tenantId: string;
    employeeId: string;
    startAt: Date;
    endAt: Date;
  }) {
    const row = await this.database
      .select({ id: leaveRequests.leaveRequestId })
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.tenantId, input.tenantId),
          eq(leaveRequests.employeeId, input.employeeId),
          inArray(leaveRequests.status, activeStatuses),
          lt(leaveRequests.startAt, input.endAt),
          gt(leaveRequests.endAt, input.startAt),
        ),
      )
      .limit(1);
    return row.length > 0;
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
    if (
      input.visibility.kind === "employees" &&
      input.visibility.employeeIds.length === 0
    ) {
      return null;
    }
    const conditions = [
      eq(leaveRequests.tenantId, input.tenantId),
      eq(leaveRequests.leaveRequestId, input.leaveRequestId),
    ];
    if (input.visibility.kind === "employees") {
      conditions.push(
        inArray(leaveRequests.employeeId, [...input.visibility.employeeIds]),
      );
    }
    const [row] = await this.database
      .select()
      .from(leaveRequests)
      .where(and(...conditions))
      .limit(1);
    if (!row) return null;
    return toDetail(toDomain(row).toSnapshot(), input.includeSensitive);
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
    if (
      input.visibility.kind === "employees" &&
      input.visibility.employeeIds.length === 0
    ) {
      return {
        items: [],
        page: input.criteria.page,
        pageSize: input.criteria.pageSize,
        hasNext: false,
      };
    }
    const conditions = [eq(leaveRequests.tenantId, input.tenantId)];
    if (input.visibility.kind === "employees") {
      conditions.push(
        inArray(leaveRequests.employeeId, [...input.visibility.employeeIds]),
      );
    }
    if (input.criteria.status) {
      conditions.push(eq(leaveRequests.status, input.criteria.status));
    }
    if (input.criteria.employeeId) {
      conditions.push(eq(leaveRequests.employeeId, input.criteria.employeeId));
    }
    if (input.criteria.periodStart) {
      conditions.push(gt(leaveRequests.endAt, input.criteria.periodStart));
    }
    if (input.criteria.periodEnd) {
      conditions.push(lt(leaveRequests.startAt, input.criteria.periodEnd));
    }

    const offset = (input.criteria.page - 1) * input.criteria.pageSize;
    const rows = await this.database
      .select()
      .from(leaveRequests)
      .where(and(...conditions))
      .orderBy(
        desc(leaveRequests.submittedAt),
        desc(leaveRequests.leaveRequestId),
      )
      .limit(input.criteria.pageSize + 1)
      .offset(offset);
    return {
      items: rows
        .slice(0, input.criteria.pageSize)
        .map((row) => toListItem(toDomain(row).toSnapshot())),
      page: input.criteria.page,
      pageSize: input.criteria.pageSize,
      hasNext: rows.length > input.criteria.pageSize,
    };
  }

  async findIdempotentResult(input: {
    tenantId: string;
    operatorId: string;
    key: string;
    payload: Readonly<Record<string, string>>;
  }) {
    const existing = await findIdempotency(this.database, input);
    if (!existing) return null;
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(input.payload))
      .digest("hex");
    if (existing.requestHash !== fingerprint) {
      throw new LeaveApplicationError(
        "IDEMPOTENCY_KEY_REUSED",
        "Idempotency key was reused with a different request.",
      );
    }
    return loadSnapshot(
      this.database,
      input.tenantId,
      existing.resultResourceId,
    );
  }

  async commit(input: Parameters<LeaveCommandTransactionPort["commit"]>[0]) {
    const fingerprint = input.idempotency
      ? createHash("sha256")
          .update(JSON.stringify(input.idempotency.payload))
          .digest("hex")
      : undefined;

    try {
      return await this.database.transaction(async (transaction) => {
        const database = transaction as PostgresDatabase;
        if (input.idempotency && fingerprint) {
          const existing = await findIdempotency(database, {
            tenantId: input.tenantId,
            operatorId: input.idempotency.operatorId,
            key: input.idempotency.key,
          });
          if (existing) {
            if (existing.requestHash !== fingerprint) {
              throw new LeaveApplicationError(
                "IDEMPOTENCY_KEY_REUSED",
                "Idempotency key was reused with a different request.",
              );
            }
            return loadSnapshot(
              database,
              input.tenantId,
              existing.resultResourceId,
            );
          }
          await database.insert(idempotencyRecords).values({
            tenantId: input.tenantId,
            operatorId: input.idempotency.operatorId,
            idempotencyKey: input.idempotency.key,
            requestHash: fingerprint,
            resultResourceId: input.request.toSnapshot().id,
            expiresAt: new Date(
              input.occurredAt.getTime() + 24 * 60 * 60 * 1000,
            ),
          });
        }

        await saveRequest(database, input.tenantId, input.request);
        const snapshot = input.request.toSnapshot();
        await database.insert(auditRecords).values({
          tenantId: input.tenantId,
          auditId: `audit_${randomUUID()}`,
          actorId: input.actorId,
          action: input.action,
          targetType: "LeaveRequest",
          targetId: snapshot.id,
          occurredAt: input.occurredAt,
          correlationId: input.correlationId,
          reason: input.auditReason ?? null,
          result: "success",
        });

        for (const event of input.domainEvents) {
          if (event.eventType === "LeaveRequestSubmitted") continue;
          const integrationEvent = toLeaveIntegrationEvent({
            event,
            request: snapshot,
            eventId: `event_${randomUUID()}`,
            correlationId: input.correlationId,
          });
          await database.insert(outboxMessages).values({
            tenantId: integrationEvent.tenantId,
            eventId: integrationEvent.eventId,
            eventType: integrationEvent.eventType,
            eventVersion: integrationEvent.eventVersion,
            payload: integrationEvent.payload,
            occurredAt: new Date(integrationEvent.occurredAt),
            correlationId: integrationEvent.correlationId,
            causationId: integrationEvent.causationId ?? null,
          });
        }
        return snapshot;
      });
    } catch (error) {
      if (postgresCode(error) === "23505" && input.idempotency && fingerprint) {
        const existing = await findIdempotency(this.database, {
          tenantId: input.tenantId,
          operatorId: input.idempotency.operatorId,
          key: input.idempotency.key,
        });
        if (existing?.requestHash === fingerprint) {
          return loadSnapshot(
            this.database,
            input.tenantId,
            existing.resultResourceId,
          );
        }
        if (existing) {
          throw new LeaveApplicationError(
            "IDEMPOTENCY_KEY_REUSED",
            "Idempotency key was reused with a different request.",
          );
        }
      }
      throw error;
    }
  }
}

async function saveRequest(
  database: PostgresDatabase,
  tenantId: string,
  request: LeaveRequest,
) {
  const snapshot = request.toSnapshot();
  if (snapshot.tenantId !== tenantId)
    throw new Error("Repository tenant mismatch.");

  try {
    if (snapshot.version === 0) {
      await database.insert(leaveRequests).values(toPersistence(snapshot));
      return;
    }
    const updated = await database
      .update(leaveRequests)
      .set(toPersistence(snapshot))
      .where(
        and(
          eq(leaveRequests.tenantId, tenantId),
          eq(leaveRequests.leaveRequestId, snapshot.id),
          eq(leaveRequests.version, snapshot.version - 1),
        ),
      )
      .returning({ id: leaveRequests.leaveRequestId });
    if (updated.length !== 1) {
      throw new LeaveApplicationError(
        "CONCURRENT_MODIFICATION",
        "Leave request was modified concurrently.",
      );
    }
  } catch (error) {
    if (error instanceof LeaveApplicationError) throw error;
    if (postgresCode(error) === "23P01") {
      throw new LeaveApplicationError(
        "LEAVE_REQUEST_OVERLAP",
        "Leave request overlaps an existing request.",
      );
    }
    throw error;
  }
}

async function findIdempotency(
  database: PostgresDatabase,
  input: { tenantId: string; operatorId: string; key: string },
) {
  const [row] = await database
    .select()
    .from(idempotencyRecords)
    .where(
      and(
        eq(idempotencyRecords.tenantId, input.tenantId),
        eq(idempotencyRecords.operatorId, input.operatorId),
        eq(idempotencyRecords.idempotencyKey, input.key),
      ),
    )
    .limit(1);
  return row;
}

async function loadSnapshot(
  database: PostgresDatabase,
  tenantId: string,
  leaveRequestId: string,
) {
  const [row] = await database
    .select()
    .from(leaveRequests)
    .where(
      and(
        eq(leaveRequests.tenantId, tenantId),
        eq(leaveRequests.leaveRequestId, leaveRequestId),
      ),
    )
    .limit(1);
  if (!row) throw new Error("Idempotency result is missing.");
  return toDomain(row).toSnapshot();
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
    approverId: item.approverId,
    approvedAt: item.approvedAt,
    rejectedAt: item.rejectedAt,
    rejectionReason: includeSensitive ? item.rejectionReason : null,
    cancelledBy: item.cancelledBy,
    cancelledAt: item.cancelledAt,
  };
}
