import { and, eq } from "drizzle-orm";

import type { PostgresDatabase } from "@/bootstrap/persistence/postgres";
import { employeeProfiles } from "@/bootstrap/persistence/schema";

import type { EmployeeLeaveProfileQueryPort } from "../../application/ports/outbound/employee-leave-profile-query-port";
import type { LeaveApprovalQueryPort } from "../../application/ports/outbound/leave-approval-query-port";
import type { LeaveVisibilityQueryPort } from "../../application/ports/outbound/leave-visibility-query-port";

export class PostgresEmployeeLeaveProfileQueryAdapter implements EmployeeLeaveProfileQueryPort {
  constructor(private readonly database: PostgresDatabase) {}

  async getEmployeeLeaveSnapshot(input: {
    tenantId: string;
    employeeId: string;
  }) {
    const [row] = await this.database
      .select()
      .from(employeeProfiles)
      .where(
        and(
          eq(employeeProfiles.tenantId, input.tenantId),
          eq(employeeProfiles.employeeId, input.employeeId),
        ),
      )
      .limit(1);
    if (
      !row ||
      !["active", "inactive", "suspended"].includes(row.employmentStatus)
    ) {
      return null;
    }

    return {
      tenantId: row.tenantId,
      employeeId: row.employeeId,
      employmentStatus: row.employmentStatus as
        "active" | "inactive" | "suspended",
      departmentId: row.departmentId,
      managerId: row.managerId,
      timezone: row.timezone,
      assignedCalendarId: row.assignedCalendarId,
      hiredAt: row.hiredAt.toISOString(),
      terminatedAt: row.terminatedAt?.toISOString() ?? null,
    };
  }
}

export class PostgresLeaveAccessQueryAdapter
  implements LeaveApprovalQueryPort, LeaveVisibilityQueryPort
{
  constructor(private readonly database: PostgresDatabase) {}

  async resolveApprover(input: {
    tenantId: string;
    employeeId: string;
    requestedAt: string;
  }) {
    const [row] = await this.database
      .select({
        managerId: employeeProfiles.managerId,
        hiredAt: employeeProfiles.hiredAt,
        terminatedAt: employeeProfiles.terminatedAt,
      })
      .from(employeeProfiles)
      .where(
        and(
          eq(employeeProfiles.tenantId, input.tenantId),
          eq(employeeProfiles.employeeId, input.employeeId),
        ),
      )
      .limit(1);
    if (!row?.managerId) return null;

    return {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      approverId: row.managerId,
      source: "manager" as const,
      routeCode: "direct-manager",
      validFrom: row.hiredAt.toISOString(),
      validUntil: row.terminatedAt?.toISOString() ?? null,
    };
  }

  async getManagedEmployeeIds(input: {
    tenantId: string;
    managerEmployeeId: string;
  }) {
    const rows = await this.database
      .select({ employeeId: employeeProfiles.employeeId })
      .from(employeeProfiles)
      .where(
        and(
          eq(employeeProfiles.tenantId, input.tenantId),
          eq(employeeProfiles.managerId, input.managerEmployeeId),
        ),
      );
    return {
      tenantId: input.tenantId,
      employeeIds: rows.map((row) => row.employeeId),
    };
  }
}
