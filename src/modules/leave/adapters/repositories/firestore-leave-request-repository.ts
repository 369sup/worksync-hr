import { createHash, randomUUID } from "node:crypto";

import { Timestamp, type Query } from "firebase-admin/firestore";

import type { FirebaseFirestore } from "@/bootstrap/persistence/firestore";

import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { LeaveRequestId } from "../../domain/value-objects/leave-request-id";
import type { LeaveRequestSnapshot } from "../../domain/aggregates/leave-request";
import { LeaveApplicationError } from "../../application/errors/leave-application-error";
import type { LeaveCommandTransactionPort } from "../../application/ports/outbound/leave-command-transaction-port";
import type { LeaveRequestQueryPort } from "../../application/ports/outbound/leave-request-query-port";
import {
  toLeaveRequest,
  toLeaveRequestDocument,
} from "./firestore-leave-request-mapper";

const activeStatuses = ["pending", "approved"] as const;

function fingerprint(payload: Readonly<Record<string, string>>) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function idempotencyId(operatorId: string, key: string) {
  return createHash("sha256").update(`${operatorId}:${key}`).digest("hex");
}

export class FirestoreLeaveRequestRepository
  implements
    LeaveRequestRepository,
    LeaveRequestQueryPort,
    LeaveCommandTransactionPort
{
  constructor(private readonly database: FirebaseFirestore) {}

  private collection(tenantId: string) {
    return this.database
      .collection("tenants")
      .doc(tenantId)
      .collection("leave_requests");
  }

  private idempotencyCollection(tenantId: string) {
    return this.database
      .collection("tenants")
      .doc(tenantId)
      .collection("idempotency_records");
  }

  async save(tenantId: string, request: Parameters<LeaveRequestRepository["save"]>[1]) {
    const snapshot = request.toSnapshot();
    if (snapshot.tenantId !== tenantId) {
      throw new Error("Repository tenant mismatch.");
    }
    await this.database.runTransaction(async (transaction) => {
      const reference = this.collection(tenantId).doc(snapshot.id);
      const current = await transaction.get(reference);
      this.assertVersion(current.exists ? current.data()?.version : null, snapshot.version);
      transaction.set(reference, toLeaveRequestDocument(snapshot));
    });
  }

  async findById(tenantId: string, id: LeaveRequestId) {
    const document = await this.collection(tenantId).doc(id.value).get();
    const data = document.data();
    return document.exists && data
      ? toLeaveRequest(tenantId, document.id, data)
      : null;
  }

  async hasOverlap(input: {
    tenantId: string;
    employeeId: string;
    startAt: Date;
    endAt: Date;
  }) {
    const result = await this.collection(input.tenantId)
      .where("employeeId", "==", input.employeeId)
      .where("status", "in", activeStatuses)
      .where("startAt", "<", Timestamp.fromDate(input.endAt))
      .get();
    return result.docs.some((document) => {
      const data = document.data();
      return (
        data.tenantId === input.tenantId &&
        data.endAt instanceof Timestamp &&
        data.endAt.toDate() > input.startAt
      );
    });
  }

  async getDetail(input: Parameters<LeaveRequestQueryPort["getDetail"]>[0]) {
    const document = await this.collection(input.tenantId)
      .doc(input.leaveRequestId)
      .get();
    const data = document.data();
    if (!document.exists || !data) return null;
    const snapshot = toLeaveRequest(
      input.tenantId,
      document.id,
      data,
    ).toSnapshot();
    if (!visible(snapshot, input.visibility)) return null;
    return toDetail(snapshot, input.includeSensitive);
  }

  async search(input: Parameters<LeaveRequestQueryPort["search"]>[0]) {
    let query: Query = this.collection(input.tenantId);
    if (input.criteria.status) {
      query = query.where("status", "==", input.criteria.status);
    }
    if (input.criteria.employeeId) {
      query = query.where("employeeId", "==", input.criteria.employeeId);
    }
    const result = await query.orderBy("submittedAt", "desc").get();
    const visibleItems = result.docs
      .map((document) =>
        toLeaveRequest(input.tenantId, document.id, document.data()).toSnapshot(),
      )
      .filter((snapshot) => visible(snapshot, input.visibility))
      .filter(
        (snapshot) =>
          (!input.criteria.periodStart ||
            new Date(snapshot.endAt) > input.criteria.periodStart) &&
          (!input.criteria.periodEnd ||
            new Date(snapshot.startAt) < input.criteria.periodEnd),
      );
    const offset = (input.criteria.page - 1) * input.criteria.pageSize;
    const page = visibleItems.slice(offset, offset + input.criteria.pageSize + 1);
    return {
      items: page.slice(0, input.criteria.pageSize).map(toListItem),
      page: input.criteria.page,
      pageSize: input.criteria.pageSize,
      hasNext: page.length > input.criteria.pageSize,
    };
  }

  async findIdempotentResult(
    input: Parameters<LeaveCommandTransactionPort["findIdempotentResult"]>[0],
  ) {
    const document = await this.idempotencyCollection(input.tenantId)
      .doc(idempotencyId(input.operatorId, input.key))
      .get();
    const data = document.data();
    if (!data) return null;
    if (data.requestHash !== fingerprint(input.payload)) {
      throw new LeaveApplicationError(
        "IDEMPOTENCY_KEY_REUSED",
        "Idempotency key was reused with a different request.",
      );
    }
    const request = await this.collection(input.tenantId)
      .doc(String(data.resultResourceId))
      .get();
    if (!request.exists || !request.data()) {
      throw new Error("Idempotency result is missing.");
    }
    return toLeaveRequest(
      input.tenantId,
      request.id,
      request.data()!,
    ).toSnapshot();
  }

  async commit(input: Parameters<LeaveCommandTransactionPort["commit"]>[0]) {
    const snapshot = input.request.toSnapshot();
    if (snapshot.tenantId !== input.tenantId) {
      throw new Error("Repository tenant mismatch.");
    }
    const requestReference = this.collection(input.tenantId).doc(snapshot.id);
    const idempotencyReference = input.idempotency
      ? this.idempotencyCollection(input.tenantId).doc(
          idempotencyId(input.idempotency.operatorId, input.idempotency.key),
        )
      : null;
    return this.database.runTransaction(async (transaction) => {
      const idempotencyDocument = idempotencyReference
        ? await transaction.get(idempotencyReference)
        : null;
      const current = await transaction.get(requestReference);

      if (idempotencyDocument?.exists && input.idempotency) {
        const data = idempotencyDocument.data()!;
        if (data.requestHash !== fingerprint(input.idempotency.payload)) {
          throw new LeaveApplicationError(
            "IDEMPOTENCY_KEY_REUSED",
            "Idempotency key was reused with a different request.",
          );
        }
        const replay = await transaction.get(
          this.collection(input.tenantId).doc(String(data.resultResourceId)),
        );
        if (!replay.exists || !replay.data()) {
          throw new Error("Idempotency result is missing.");
        }
        return toLeaveRequest(
          input.tenantId,
          replay.id,
          replay.data()!,
        ).toSnapshot();
      }

      this.assertVersion(current.exists ? current.data()?.version : null, snapshot.version);
      transaction.set(requestReference, toLeaveRequestDocument(snapshot));

      const auditReference = this.database
        .collection("tenants")
        .doc(input.tenantId)
        .collection("audit_records")
        .doc(`audit_${randomUUID()}`);
      transaction.create(auditReference, {
        tenantId: input.tenantId,
        recordId: auditReference.id,
        actorId: input.actor.userId,
        membershipId: input.actor.membershipId,
        action: input.action,
        targetRef: { type: "LeaveRequest", id: snapshot.id },
        result: "success",
        reason: input.auditReason ?? null,
        requestId: input.actor.requestId,
        requestSource: input.actor.requestSource,
        occurredAt: Timestamp.fromDate(input.occurredAt),
        metadata: {},
      });

      if (idempotencyReference && input.idempotency) {
        transaction.create(idempotencyReference, {
          tenantId: input.tenantId,
          operatorId: input.idempotency.operatorId,
          idempotencyKey: input.idempotency.key,
          requestHash: fingerprint(input.idempotency.payload),
          resultResourceId: snapshot.id,
          createdAt: Timestamp.fromDate(input.occurredAt),
          expiresAt: Timestamp.fromMillis(
            input.occurredAt.getTime() + 24 * 60 * 60 * 1000,
          ),
        });
      }

      return snapshot;
    });
  }

  private assertVersion(persistedVersion: unknown, nextVersion: number) {
    const expected = nextVersion === 0 ? null : nextVersion - 1;
    if (persistedVersion !== expected) {
      throw new LeaveApplicationError(
        "CONCURRENT_MODIFICATION",
        "Leave request was modified concurrently.",
      );
    }
  }
}

function visible(
  snapshot: LeaveRequestSnapshot,
  scope: Parameters<LeaveRequestQueryPort["getDetail"]>[0]["visibility"],
) {
  return (
    scope.kind === "tenant" || scope.employeeIds.includes(snapshot.employeeId)
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
