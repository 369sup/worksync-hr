import { sql } from "drizzle-orm";
import {
  check,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const employeeProfileSchema = pgSchema("employee_profile");

export const organizationMemberships = employeeProfileSchema.table(
  "organization_memberships",
  {
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    employeeId: text("employee_id"),
    status: text("status").notNull(),
    capabilities: jsonb("capabilities")
      .$type<readonly string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.userId] }),
    check(
      "organization_membership_status_valid",
      sql`${table.status} in ('active', 'inactive')`,
    ),
    check(
      "organization_membership_capabilities_array",
      sql`jsonb_typeof(${table.capabilities}) = 'array'`,
    ),
  ],
);

export const employeeProfiles = employeeProfileSchema.table(
  "employee_profiles",
  {
    tenantId: text("tenant_id").notNull(),
    employeeId: text("employee_id").notNull(),
    employmentStatus: text("employment_status").notNull(),
    departmentId: text("department_id"),
    managerId: text("manager_id"),
    timezone: text("timezone").notNull(),
    assignedCalendarId: text("assigned_calendar_id"),
    hiredAt: timestamp("hired_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    terminatedAt: timestamp("terminated_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.employeeId] }),
    check(
      "employee_profile_status_valid",
      sql`${table.employmentStatus} in ('active', 'inactive', 'suspended')`,
    ),
  ],
);
