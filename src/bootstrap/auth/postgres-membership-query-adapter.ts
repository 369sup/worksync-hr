import { and, eq } from "drizzle-orm";

import type { PostgresDatabase } from "@/bootstrap/persistence/postgres";
import { organizationMemberships } from "@/bootstrap/persistence/schema";

import type { OrganizationMembershipQueryPort } from "./actor-context-factory";

export class PostgresMembershipQueryAdapter implements OrganizationMembershipQueryPort {
  constructor(private readonly database: PostgresDatabase) {}

  async getMembership(input: { tenantId: string; userId: string }) {
    const [row] = await this.database
      .select()
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.tenantId, input.tenantId),
          eq(organizationMemberships.userId, input.userId),
        ),
      )
      .limit(1);
    if (!row || (row.status !== "active" && row.status !== "inactive"))
      return null;

    return {
      tenantId: row.tenantId,
      userId: row.userId,
      employeeId: row.employeeId,
      status: row.status,
      capabilities: row.capabilities,
    } as const;
  }
}
