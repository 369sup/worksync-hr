import { NextRequest, NextResponse } from "next/server";

import {
  HttpValidationError,
  offsetDate,
  parseSearchCriteria,
  readJsonObject,
  requiredString,
  withLeaveActor,
} from "./_lib/leave-http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withLeaveActor(request, async ({ runtime: leave, actor }) => {
    const body = await readJsonObject(request);
    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new HttpValidationError("Idempotency-Key header is required.", {
        idempotencyKey: ["Idempotency-Key header is required."],
      });
    }
    const startAt = requiredString(body, "startAt");
    const endAt = requiredString(body, "endAt");
    const result = await leave.submit.execute({
      actor,
      leaveTypeId: requiredString(body, "leaveTypeId"),
      leaveTypeCode: requiredString(body, "leaveTypeCode"),
      startAt: offsetDate(startAt, "startAt"),
      endAt: offsetDate(endAt, "endAt"),
      reason: requiredString(body, "reason"),
      idempotencyKey,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  });
}

export async function GET(request: NextRequest) {
  return withLeaveActor(request, async ({ runtime: leave, actor }) => {
    const result = await leave.search.execute({
      actor,
      criteria: parseSearchCriteria(request.url),
    });
    return NextResponse.json({
      data: result.items,
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        hasNext: result.hasNext,
      },
    });
  });
}
