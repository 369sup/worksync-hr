import {
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const integrationSchema = pgSchema("integration");

export const outboxMessages = integrationSchema.table(
  "outbox_messages",
  {
    tenantId: text("tenant_id").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    eventVersion: integer("event_version").notNull(),
    payload: jsonb("payload")
      .$type<Readonly<Record<string, unknown>>>()
      .notNull(),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    correlationId: text("correlation_id").notNull(),
    causationId: text("causation_id"),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    failureCode: text("failure_code"),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.eventId] })],
);
