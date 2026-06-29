import { NextRequest, NextResponse } from "next/server";

import { pathId, withLeaveActor } from "../_lib/leave-http";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withLeaveActor(request, async ({ runtime: leave, actor }) => {
    const { id } = await context.params;
    const result = await leave.getDetail.execute({
      actor,
      leaveRequestId: pathId(id),
    });
    return NextResponse.json({ data: result });
  });
}
