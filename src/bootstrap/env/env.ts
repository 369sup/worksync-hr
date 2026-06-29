export interface ServerEnvironment {
  readonly appName: "sup-hr-app";
  readonly routeRoot: "src/app";
  readonly databaseUrl: string;
  readonly appTenantId: string;
  readonly firebase: {
    readonly projectId: string;
    readonly clientEmail?: string;
    readonly privateKey?: string;
    readonly sessionExpiresInMs: number;
    readonly workspaceDomain?: string;
  };
}

export interface FirebaseClientEnvironment {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly appId: string;
}

const FIVE_DAYS_IN_MS = 5 * 24 * 60 * 60 * 1000;

function required(source: NodeJS.ProcessEnv, key: string) {
  const value = source[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(source: NodeJS.ProcessEnv, key: string) {
  const value = source[key]?.trim();
  return value || undefined;
}

function sessionDuration(source: NodeJS.ProcessEnv) {
  const raw = optional(source, "FIREBASE_SESSION_EXPIRES_IN_MS");
  if (!raw) return FIVE_DAYS_IN_MS;

  const value = Number(raw);
  const minimum = 5 * 60 * 1000;
  const maximum = 14 * 24 * 60 * 60 * 1000;
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      "FIREBASE_SESSION_EXPIRES_IN_MS must be an integer between 5 minutes and 14 days.",
    );
  }
  return value;
}

export function readServerEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): ServerEnvironment {
  const clientEmail = optional(source, "FIREBASE_CLIENT_EMAIL");
  const privateKey = optional(source, "FIREBASE_PRIVATE_KEY")?.replace(
    /\\n/g,
    "\n",
  );

  if ((clientEmail && !privateKey) || (!clientEmail && privateKey)) {
    throw new Error(
      "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be configured together.",
    );
  }

  return {
    appName: "sup-hr-app",
    routeRoot: "src/app",
    databaseUrl: required(source, "DATABASE_URL"),
    appTenantId: required(source, "APP_TENANT_ID"),
    firebase: {
      projectId: required(source, "FIREBASE_PROJECT_ID"),
      clientEmail,
      privateKey,
      sessionExpiresInMs: sessionDuration(source),
      workspaceDomain: optional(
        source,
        "GOOGLE_WORKSPACE_DOMAIN",
      )?.toLowerCase(),
    },
  };
}

export function readFirebaseClientEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): FirebaseClientEnvironment {
  return {
    apiKey: required(source, "NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: required(source, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: required(source, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    appId: required(source, "NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
}
