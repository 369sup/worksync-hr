"use client";

import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

function required(value: string | undefined, key: string) {
  if (!value) throw new Error(`Missing public Firebase configuration: ${key}`);
  return value;
}

function firebaseAuth() {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: required(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        "NEXT_PUBLIC_FIREBASE_API_KEY",
      ),
      authDomain: required(
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      ),
      projectId: required(
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      ),
      appId: required(
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ),
    });
  return getAuth(app);
}

async function csrfToken() {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to create request proof.");
  const body = (await response.json()) as { csrfToken?: unknown };
  if (typeof body.csrfToken !== "string")
    throw new Error("Invalid request proof response.");
  return body.csrfToken;
}

export async function signInWithGoogle() {
  const auth = firebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken(true);
  const csrf = await csrfToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error("Unable to create application session.");
}

export async function signOutSession() {
  const csrf = await csrfToken();
  const response = await fetch("/api/auth/session", {
    method: "DELETE",
    headers: { "x-csrf-token": csrf },
  });
  if (!response.ok) throw new Error("Unable to clear application session.");
  await signOut(firebaseAuth());
}
