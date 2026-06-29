import { sql } from "drizzle-orm";
import {
  check,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const auditSchema = pgSchema("audit");

export const auditRecords = auditSchema.table(
  "audit_records",
  {
    tenantId: text("tenant_id").notNull(),
    auditId: text("audit_id").notNull(),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    correlationId: text("correlation_id").notNull(),
    reason: text("reason"),
    result: text("result").notNull(),
    metadata: jsonb("metadata").$type<Readonly<Record<string, unknown>>>(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.auditId] }),
    check(
      "audit_result_valid",
      sql`${table.result} in ('success', 'denied', 'failed')`,
    ),
  ],
);
