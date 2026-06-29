import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";

import type { ServerEnvironment } from "@/bootstrap/env/env";

import * as schema from "./schema";

export type PostgresDatabase = NodePgDatabase<typeof schema>;

export function createPostgresDatabase(environment: ServerEnvironment) {
  const pool = new Pool({ connectionString: environment.databaseUrl });
  return {
    database: drizzle(pool, { schema }),
    async verifyReady() {
      const result = await drizzle(pool).execute<{ leaveTable: string | null }>(
        sql`select to_regclass('leave.leave_requests')::text as "leaveTable"`,
      );
      return result.rows[0]?.leaveTable === "leave.leave_requests";
    },
    close: () => pool.end(),
  };
}
