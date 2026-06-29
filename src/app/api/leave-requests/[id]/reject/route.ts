import { NextRequest, NextResponse } from "next/server";

import {
  pathId,
  readJsonObject,
  requiredString,
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
    const result = await leave.reject.execute({
      actor,
      leaveRequestId: pathId(id),
      rejectionReason: requiredString(body, "rejectionReason"),
    });
    return NextResponse.json({ data: result });
  });
}
