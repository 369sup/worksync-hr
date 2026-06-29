import { NextRequest, NextResponse } from "next/server";

import { createFirebaseAdminAuth } from "@/bootstrap/auth/firebase-admin";
import {
  FirebaseAuthenticationAdapter,
  UnauthenticatedError,
} from "@/bootstrap/auth/firebase-authentication-adapter";
import { readServerEnvironment } from "@/bootstrap/env/env";

export const runtime = "nodejs";

const SESSION_COOKIE = "__session";
const CSRF_COOKIE = "__csrf";

function errorResponse(
  code: string,
  message: string,
  status: number,
  correlationId: string,
) {
  return NextResponse.json(
    { error: { code, message, correlationId } },
    { status },
  );
}

function validateRequest(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  const csrfHeader = request.headers.get("x-csrf-token");
  const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value;
  return (
    requestOrigin === expectedOrigin &&
    Boolean(csrfHeader) &&
    csrfHeader === csrfCookie
  );
}

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  if (!validateRequest(request)) {
    return errorResponse(
      "FORBIDDEN",
      "Invalid request proof.",
      403,
      correlationId,
    );
  }

  try {
    const body: unknown = await request.json();
    const idToken =
      typeof body === "object" && body && "idToken" in body
        ? body.idToken
        : undefined;
    if (typeof idToken !== "string" || !idToken.trim()) {
      return errorResponse(
        "INVALID_INPUT",
        "Firebase ID token is required.",
        400,
        correlationId,
      );
    }

    const environment = readServerEnvironment();
    const authentication = new FirebaseAuthenticationAdapter(
      createFirebaseAdminAuth(environment),
      environment.firebase,
    );
    const sessionCookie = await authentication.createSessionCookie(idToken);
    const response = NextResponse.json({ data: { authenticated: true } });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(environment.firebase.sessionExpiresInMs / 1000),
    });
    response.cookies.delete(CSRF_COOKIE);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return errorResponse(
        "UNAUTHENTICATED",
        error.message,
        401,
        correlationId,
      );
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Unable to create session.",
      500,
      correlationId,
    );
  }
}

export function DELETE(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  if (!validateRequest(request)) {
    return errorResponse(
      "FORBIDDEN",
      "Invalid request proof.",
      403,
      correlationId,
    );
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(CSRF_COOKIE);
  return response;
}
