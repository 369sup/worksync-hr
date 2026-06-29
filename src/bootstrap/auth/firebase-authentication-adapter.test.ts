import type { DecodedIdToken } from "firebase-admin/auth";
import { describe, expect, it, vi } from "vitest";

import {
  FirebaseAuthenticationAdapter,
  type FirebaseAuthClient,
} from "./firebase-authentication-adapter";

function token(overrides: Partial<DecodedIdToken> = {}): DecodedIdToken {
  return {
    aud: "firebase-test",
    auth_time: Math.floor(
      new Date("2026-06-28T08:00:00.000Z").getTime() / 1000,
    ),
    exp: 2_000_000_000,
    firebase: {
      identities: {},
      sign_in_provider: "google.com",
    },
    iat: 1_000_000_000,
    iss: "https://securetoken.google.com/firebase-test",
    sub: "firebase-user-1",
    uid: "firebase-user-1",
    email: "employee@example.com",
    email_verified: true,
    ...overrides,
  };
}

function authClient(decoded = token()): FirebaseAuthClient {
  return {
    verifyIdToken: vi.fn().mockResolvedValue(decoded),
    createSessionCookie: vi.fn().mockResolvedValue("session-cookie"),
    verifySessionCookie: vi.fn().mockResolvedValue(decoded),
  };
}

const now = () => new Date("2026-06-28T08:04:00.000Z");

describe("FirebaseAuthenticationAdapter", () => {
  it("creates a server session for a verified Google Workspace identity", async () => {
    const adapter = new FirebaseAuthenticationAdapter(authClient(), {
      sessionExpiresInMs: 432_000_000,
      workspaceDomain: "example.com",
      now,
    });

    await expect(
      adapter.createSessionCookie("firebase-id-token"),
    ).resolves.toBe("session-cookie");
  });

  it("rejects an identity outside the configured Workspace domain", async () => {
    const adapter = new FirebaseAuthenticationAdapter(
      authClient(token({ email: "employee@outside.example" })),
      {
        sessionExpiresInMs: 432_000_000,
        workspaceDomain: "example.com",
        now,
      },
    );

    await expect(
      adapter.createSessionCookie("firebase-id-token"),
    ).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("maps a verified session cookie to provider-neutral identity", async () => {
    const adapter = new FirebaseAuthenticationAdapter(authClient(), {
      sessionExpiresInMs: 432_000_000,
      now,
    });

    await expect(
      adapter.verifySessionCookie("session-cookie"),
    ).resolves.toEqual({
      userId: "firebase-user-1",
      email: "employee@example.com",
      emailVerified: true,
      providerId: "google.com",
    });
  });
});
