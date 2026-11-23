import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";

type FirebaseServices = {
  auth: ReturnType<typeof getAuth>;
  db: Firestore;
};

let services: FirebaseServices | undefined;

export function getFirebaseServices(): FirebaseServices {
  if (services) return services;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Firebase is not configured. Set FIREBASE_PROJECT_ID.");
  }

  const existingApp = getApps().find((app) => app.name === "softhard-api");
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const hasIndividualCredentials = Boolean(clientEmail || privateKey);

  if (hasIndividualCredentials && (!clientEmail || !privateKey)) {
    throw new Error("Set both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
  }

  const credential = serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson) as ServiceAccount)
    : hasIndividualCredentials
      ? cert({
          projectId,
          clientEmail,
          privateKey: privateKey!.replace(/\\n/g, "\n"),
        })
      : applicationDefault();

  const app = existingApp ?? initializeApp(
    {
      projectId,
      credential,
    },
    "softhard-api",
  );

  services = { auth: getAuth(app), db: getFirestore(app) };
  return services;
}

export { FieldValue, Timestamp };
