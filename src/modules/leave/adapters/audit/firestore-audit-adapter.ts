import { Timestamp } from "firebase-admin/firestore";

import type { FirebaseFirestore } from "@/bootstrap/persistence/firestore";
import type { AuditPort } from "@/modules/leave/application/ports/outbound/audit-port";

export class FirestoreAuditAdapter implements AuditPort {
  constructor(private readonly database: FirebaseFirestore) {}

  async append(input: Parameters<AuditPort["append"]>[0]) {
    const reference = this.database
      .collection("tenants")
      .doc(input.actor.tenantId)
      .collection("audit_records")
      .doc();
    await reference.create({
      tenantId: input.actor.tenantId,
      recordId: reference.id,
      actorId: input.actor.userId,
      membershipId: input.actor.membershipId,
      action: input.action,
      targetRef: input.targetRef,
      result: input.result,
      reason: input.reason ?? null,
      requestId: input.actor.requestId,
      requestSource: input.actor.requestSource,
      occurredAt: Timestamp.fromDate(input.occurredAt),
      metadata: {},
    });
  }
}
