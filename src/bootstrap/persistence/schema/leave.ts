import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const leaveSchema = pgSchema("leave");

export const leaveRequests = leaveSchema.table(
  "leave_requests",
  {
    tenantId: text("tenant_id").notNull(),
    leaveRequestId: text("leave_request_id").notNull(),
    employeeId: text("employee_id").notNull(),
    leaveTypeId: text("leave_type_id").notNull(),
    leaveTypeCode: text("leave_type_code").notNull(),
    startAt: timestamp("start_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true, mode: "date" }).notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull(),
    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    approverId: text("approver_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true, mode: "date" }),
    rejectionReason: text("rejection_reason"),
    cancelledBy: text("cancelled_by"),
    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
      mode: "date",
    }),
    overrideReason: text("override_reason"),
    version: integer("version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.leaveRequestId] }),
    check("leave_request_period_valid", sql`${table.endAt} > ${table.startAt}`),
    check(
      "leave_request_reason_not_blank",
      sql`length(btrim(${table.reason})) > 0`,
    ),
    check(
      "leave_type_id_not_blank",
      sql`length(btrim(${table.leaveTypeId})) > 0`,
    ),
    check(
      "leave_type_code_not_blank",
      sql`length(btrim(${table.leaveTypeCode})) > 0`,
    ),
    check(
      "leave_request_status_valid",
      sql`${table.status} in ('pending', 'approved', 'rejected', 'cancelled')`,
    ),
    check("leave_request_version_non_negative", sql`${table.version} >= 0`),
    check(
      "leave_request_state_fields_consistent",
      sql`(
        (${table.status} = 'pending' and ${table.approverId} is null and ${table.approvedAt} is null and ${table.rejectedAt} is null and ${table.rejectionReason} is null and ${table.cancelledBy} is null and ${table.cancelledAt} is null)
        or (${table.status} = 'approved' and ${table.approverId} is not null and ${table.approvedAt} is not null and ${table.rejectedAt} is null and ${table.rejectionReason} is null and ${table.cancelledBy} is null and ${table.cancelledAt} is null)
        or (${table.status} = 'rejected' and ${table.approverId} is not null and ${table.approvedAt} is null and ${table.rejectedAt} is not null and length(btrim(${table.rejectionReason})) > 0 and ${table.cancelledBy} is null and ${table.cancelledAt} is null)
        or (${table.status} = 'cancelled' and ${table.approverId} is null and ${table.approvedAt} is null and ${table.rejectedAt} is null and ${table.rejectionReason} is null and ${table.cancelledBy} is not null and ${table.cancelledAt} is not null)
      )`,
    ),
    index("leave_request_employee_submitted_idx").on(
      table.tenantId,
      table.employeeId,
      table.submittedAt,
    ),
    index("leave_request_status_submitted_idx").on(
      table.tenantId,
      table.status,
      table.submittedAt,
    ),
    index("leave_request_approver_status_idx").on(
      table.tenantId,
      table.approverId,
      table.status,
      table.submittedAt,
    ),
  ],
);

export const idempotencyRecords = leaveSchema.table(
  "idempotency_records",
  {
    tenantId: text("tenant_id").notNull(),
    operatorId: text("operator_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    requestHash: text("request_hash").notNull(),
    resultResourceId: text("result_resource_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.tenantId, table.operatorId, table.idempotencyKey],
    }),
  ],
);
