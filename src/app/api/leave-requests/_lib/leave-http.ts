import { NextRequest, NextResponse } from "next/server";

import { MembershipInactiveError } from "@/bootstrap/auth/actor-context-factory";
import { UnauthenticatedError } from "@/bootstrap/auth/firebase-authentication-adapter";
import {
  createLeaveApiRuntime,
  type LeaveApiRuntime,
} from "@/bootstrap/composition/create-leave-api-runtime";
import type { LeaveRequestStatus } from "@/modules/leave/domain/aggregates/leave-request";
import { LeaveDomainError } from "@/modules/leave/domain/errors/leave-domain-error";
import { LeaveApplicationError } from "@/modules/leave/application/errors/leave-application-error";
import type { LeaveRequestSearchCriteria } from "@/modules/leave/application/query-models/leave-request-list-item";
import type { ActorContext } from "@/shared/types/actor-context";

const SESSION_COOKIE = "__session";
const offsetTimestamp =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export class HttpValidationError extends Error {
  readonly code = "INVALID_INPUT";

  constructor(
    message: string,
    readonly fieldErrors?: Readonly<Record<string, readonly string[]>>,
  ) {
    super(message);
    this.name = "HttpValidationError";
  }
}

export async function withLeaveActor(
  request: NextRequest,
  handler: (input: {
    runtime: LeaveApiRuntime;
    actor: ActorContext;
    correlationId: string;
  }) => Promise<Response>,
) {
  const correlationId =
    request.headers.get("x-correlation-id")?.trim() || crypto.randomUUID();
  let runtime: LeaveApiRuntime | undefined;
  try {
    runtime = createLeaveApiRuntime();
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionCookie) throw new UnauthenticatedError();
    const identity =
      await runtime.authentication.verifySessionCookie(sessionCookie);
    const actor = await runtime.actors.create(identity, correlationId);
    return await handler({ runtime, actor, correlationId });
  } catch (error) {
    return toErrorResponse(error, correlationId);
  } finally {
    await runtime?.close();
  }
}

export function toErrorResponse(error: unknown, correlationId: string) {
  const code = errorCode(error);
  const status = statusFor(code);
  const message =
    error instanceof Error && status !== 500
      ? error.message
      : "An unexpected server error occurred.";
  return NextResponse.json(
    {
      error: {
        code,
        message,
        correlationId,
        ...(error instanceof HttpValidationError && error.fieldErrors
          ? { fieldErrors: error.fieldErrors }
          : {}),
      },
    },
    { status },
  );
}

function errorCode(error: unknown) {
  if (error instanceof HttpValidationError) return error.code;
  if (error instanceof UnauthenticatedError) return error.code;
  if (error instanceof MembershipInactiveError) return error.code;
  if (error instanceof LeaveApplicationError) return error.code;
  if (error instanceof LeaveDomainError) return error.code;
  return "INTERNAL_ERROR";
}

function statusFor(code: string) {
  if (
    [
      "INVALID_INPUT",
      "INVALID_LEAVE_PERIOD",
      "REJECTION_REASON_REQUIRED",
      "OVERRIDE_REASON_REQUIRED",
    ].includes(code)
  )
    return 400;
  if (code === "UNAUTHENTICATED") return 401;
  if (
    ["MEMBERSHIP_INACTIVE", "FORBIDDEN", "SELF_APPROVAL_FORBIDDEN"].includes(
      code,
    )
  )
    return 403;
  if (code === "NOT_FOUND") return 404;
  if (
    [
      "EMPLOYEE_NOT_FOUND",
      "EMPLOYEE_NOT_ELIGIBLE_FOR_LEAVE",
      "CALENDAR_NOT_ASSIGNED",
      "LEAVE_REQUEST_OVERLAP",
      "INVALID_STATE",
      "CONCURRENT_MODIFICATION",
      "IDEMPOTENCY_KEY_REUSED",
    ].includes(code)
  )
    return 409;
  if (["CALENDAR_NOT_AVAILABLE", "UPSTREAM_UNAVAILABLE"].includes(code))
    return 503;
  return 500;
}

export async function readJsonObject(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpValidationError("Request body must be valid JSON.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpValidationError("Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}

export function requiredString(source: Record<string, unknown>, field: string) {
  const value = source[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpValidationError(`${field} is required.`, {
      [field]: [`${field} is required.`],
    });
  }
  return value.trim();
}

export function optionalString(source: Record<string, unknown>, field: string) {
  const value = source[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpValidationError(`${field} must be a non-empty string.`, {
      [field]: [`${field} must be a non-empty string.`],
    });
  }
  return value.trim();
}

export function offsetDate(value: string, field: string) {
  const date = new Date(value);
  if (!offsetTimestamp.test(value) || !Number.isFinite(date.getTime())) {
    throw new HttpValidationError(
      `${field} must be an ISO 8601 timestamp with an offset.`,
      { [field]: [`${field} must include a valid timezone offset.`] },
    );
  }
  return date;
}

export function pathId(value: string) {
  const id = value.trim();
  if (!id) throw new HttpValidationError("Leave request id is required.");
  return id;
}

export function parseSearchCriteria(url: string): LeaveRequestSearchCriteria {
  const parameters = new URL(url).searchParams;
  const page = integerParameter(
    parameters,
    "page",
    1,
    1,
    Number.MAX_SAFE_INTEGER,
  );
  const pageSize = integerParameter(parameters, "pageSize", 20, 1, 100);
  const status = parameters.get("status")?.trim();
  let parsedStatus: LeaveRequestStatus | undefined;
  if (status && !isLeaveStatus(status)) {
    throw new HttpValidationError("status is invalid.", {
      status: ["status must be pending, approved, rejected, or cancelled."],
    });
  }
  if (status && isLeaveStatus(status)) parsedStatus = status;
  const periodStartValue = parameters.get("periodStart")?.trim();
  const periodEndValue = parameters.get("periodEnd")?.trim();

  return {
    page,
    pageSize,
    ...(parsedStatus ? { status: parsedStatus } : {}),
    ...(parameters.get("employeeId")?.trim()
      ? { employeeId: parameters.get("employeeId")!.trim() }
      : {}),
    ...(periodStartValue
      ? { periodStart: offsetDate(periodStartValue, "periodStart") }
      : {}),
    ...(periodEndValue
      ? { periodEnd: offsetDate(periodEndValue, "periodEnd") }
      : {}),
  };
}

function integerParameter(
  parameters: URLSearchParams,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const raw = parameters.get(name);
  if (raw === null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new HttpValidationError(`${name} is invalid.`, {
      [name]: [`${name} must be an integer from ${minimum} to ${maximum}.`],
    });
  }
  return value;
}

function isLeaveStatus(value: string): value is LeaveRequestStatus {
  return ["pending", "approved", "rejected", "cancelled"].includes(value);
}
