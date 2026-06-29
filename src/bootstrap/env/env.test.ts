import { describe, expect, it } from "vitest";

import { readServerEnvironment } from "./env";

const validEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/sup_hr",
  APP_TENANT_ID: "tenant_test",
  FIREBASE_PROJECT_ID: "firebase-test",
  FIREBASE_CLIENT_EMAIL: "firebase@example.com",
  FIREBASE_PRIVATE_KEY: "line-1\\nline-2",
  GOOGLE_WORKSPACE_DOMAIN: "Example.COM",
};

describe("readServerEnvironment", () => {
  it("normalizes Firebase configuration", () => {
    const environment = readServerEnvironment(validEnvironment);

    expect(environment.firebase.privateKey).toBe("line-1\nline-2");
    expect(environment.firebase.workspaceDomain).toBe("example.com");
    expect(environment.firebase.sessionExpiresInMs).toBe(432_000_000);
  });

  it("fails fast without a required value", () => {
    expect(() =>
      readServerEnvironment({ ...validEnvironment, APP_TENANT_ID: "" }),
    ).toThrow("Missing required environment variable: APP_TENANT_ID");
  });
});
