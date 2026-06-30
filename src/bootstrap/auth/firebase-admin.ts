import {
  applicationDefault,
  cert,
  type App,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import type { ServerEnvironment } from "@/bootstrap/env/env";

const FIREBASE_APP_NAME = "worksync-hr-server";

export function createFirebaseAdminApp(environment: ServerEnvironment): App {
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  return (
    existing ??
    initializeApp(
      {
        projectId: environment.firebase.projectId,
        credential:
          environment.firebase.clientEmail && environment.firebase.privateKey
            ? cert({
                projectId: environment.firebase.projectId,
                clientEmail: environment.firebase.clientEmail,
                privateKey: environment.firebase.privateKey,
              })
            : applicationDefault(),
      },
      FIREBASE_APP_NAME,
    )
  );
}

export function createFirebaseAdminAuth(environment: ServerEnvironment) {
  return getAuth(createFirebaseAdminApp(environment));
}
