import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const csrfToken = crypto.randomUUID();
  const response = NextResponse.json({ csrfToken });
  response.cookies.set("__csrf", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
