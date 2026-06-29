import { NextRequest, NextResponse } from "next/server";

import { pathId, withLeaveActor } from "../../_lib/leave-http";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withLeaveActor(request, async ({ runtime: leave, actor }) => {
    const { id } = await context.params;
    const result = await leave.approve.execute({
      actor,
      leaveRequestId: pathId(id),
    });
    return NextResponse.json({ data: result });
  });
}
