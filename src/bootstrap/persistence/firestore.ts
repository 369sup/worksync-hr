import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { createFirebaseAdminApp } from "@/bootstrap/auth/firebase-admin";
import type { ServerEnvironment } from "@/bootstrap/env/env";

export type FirebaseFirestore = Firestore;

export function createFirestoreDatabase(environment: ServerEnvironment) {
  const database = getFirestore(createFirebaseAdminApp(environment));
  return {
    database,
    async verifyReady() {
      await database.listCollections();
      return true;
    },
    async close() {
      // Firebase Admin apps are process singletons and must survive requests.
    },
  };
}
