import { NextRequest, NextResponse } from "next/server";

import {
  optionalString,
  pathId,
  readJsonObject,
  withLeaveActor,
} from "../../_lib/leave-http";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withLeaveActor(request, async ({ runtime: leave, actor }) => {
    const { id } = await context.params;
    const body = await readJsonObject(request);
    const overrideReason = optionalString(body, "overrideReason");
    const result = await leave.cancel.execute({
      actor,
      leaveRequestId: pathId(id),
      ...(overrideReason ? { overrideReason } : {}),
    });
    return NextResponse.json({ data: result });
  });
}
