import type { DecodedIdToken } from "firebase-admin/auth";

export interface FirebaseAuthClient {
  verifyIdToken(
    idToken: string,
    checkRevoked?: boolean,
  ): Promise<DecodedIdToken>;
  createSessionCookie(
    idToken: string,
    options: { expiresIn: number },
  ): Promise<string>;
  verifySessionCookie(
    sessionCookie: string,
    checkRevoked?: boolean,
  ): Promise<DecodedIdToken>;
}

export interface AuthenticatedIdentity {
  readonly userId: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly providerId: string;
}

export class UnauthenticatedError extends Error {
  readonly code = "UNAUTHENTICATED";

  constructor() {
    super("Authentication is required.");
    this.name = "UnauthenticatedError";
  }
}

export class FirebaseAuthenticationAdapter {
  constructor(
    private readonly auth: FirebaseAuthClient,
    private readonly options: {
      readonly sessionExpiresInMs: number;
      readonly workspaceDomain?: string;
      readonly now?: () => Date;
    },
  ) {}

  async createSessionCookie(idToken: string) {
    try {
      const decoded = await this.auth.verifyIdToken(idToken, true);
      this.toIdentity(decoded);
      this.assertRecentSignIn(decoded);
      return await this.auth.createSessionCookie(idToken, {
        expiresIn: this.options.sessionExpiresInMs,
      });
    } catch (error) {
      if (error instanceof UnauthenticatedError) throw error;
      throw new UnauthenticatedError();
    }
  }

  async verifySessionCookie(
    sessionCookie: string,
  ): Promise<AuthenticatedIdentity> {
    try {
      const decoded = await this.auth.verifySessionCookie(sessionCookie, true);
      return this.toIdentity(decoded);
    } catch (error) {
      if (error instanceof UnauthenticatedError) throw error;
      throw new UnauthenticatedError();
    }
  }

  private assertRecentSignIn(decoded: DecodedIdToken) {
    const nowInSeconds = Math.floor(
      (this.options.now?.() ?? new Date()).getTime() / 1000,
    );
    if (nowInSeconds - decoded.auth_time > 5 * 60)
      throw new UnauthenticatedError();
  }

  private toIdentity(decoded: DecodedIdToken): AuthenticatedIdentity {
    const providerId = decoded.firebase?.sign_in_provider ?? "unknown";
    const email = decoded.email ?? null;
    const emailVerified = decoded.email_verified === true;

    if (providerId !== "google.com") throw new UnauthenticatedError();

    const workspaceDomain = this.options.workspaceDomain?.toLowerCase();
    if (workspaceDomain) {
      const domain = email?.split("@").at(-1)?.toLowerCase();
      if (!emailVerified || domain !== workspaceDomain)
        throw new UnauthenticatedError();
    }

    return {
      userId: decoded.uid,
      email,
      emailVerified,
      providerId,
    };
  }
}
