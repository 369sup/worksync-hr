import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import type { ServerEnvironment } from "@/bootstrap/env/env";

const FIREBASE_APP_NAME = "sup-hr-app-server";

export function createFirebaseAdminAuth(environment: ServerEnvironment) {
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  const app =
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
    );

  return getAuth(app);
}
