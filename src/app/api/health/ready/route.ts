import { NextResponse } from "next/server";

import { readServerEnvironment } from "@/bootstrap/env/env";
import { createFirestoreDatabase } from "@/bootstrap/persistence/firestore";

export const runtime = "nodejs";

export async function GET() {
  let persistence: ReturnType<typeof createFirestoreDatabase> | undefined;
  try {
    const environment = readServerEnvironment();
    persistence = createFirestoreDatabase(environment);
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
