import { Router, type Request, type Response } from "express";
import { roleOf } from "./auth.js";
import { getFirebaseServices } from "./firebase.js";

export const sessionRouter = Router();

sessionRouter.get("/me", async (request: Request, response: Response) => {
  const token = request.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    response.status(401).json({ error: "AUTH_REQUIRED", message: "Sign in to continue." });
    return;
  }
  try {
    const user = await getFirebaseServices().auth.verifyIdToken(token);
    response.json({ uid: user.uid, email: user.email ?? null, role: roleOf(user) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Firebase is not configured")) {
      response.status(503).json({ error: "FIREBASE_NOT_CONFIGURED", message: "The API is not connected to Firebase yet." });
      return;
    }
    response.status(401).json({ error: "INVALID_TOKEN", message: "The sign-in token is invalid or expired." });
  }
});
