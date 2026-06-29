import { NextResponse } from "next/server";

import { readServerEnvironment } from "@/bootstrap/env/env";
import { createPostgresDatabase } from "@/bootstrap/persistence/postgres";

export const runtime = "nodejs";

export async function GET() {
  let persistence: ReturnType<typeof createPostgresDatabase> | undefined;
  try {
    const environment = readServerEnvironment();
    persistence = createPostgresDatabase(environment);
    if (!(await persistence.verifyReady())) {
      return NextResponse.json({ status: "not-ready" }, { status: 503 });
    }
    return NextResponse.json({ status: "ready" });
  } catch {
    return NextResponse.json({ status: "not-ready" }, { status: 503 });
  } finally {
    await persistence?.close();
  }
}
