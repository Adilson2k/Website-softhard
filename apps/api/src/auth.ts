import type { DecodedIdToken } from "firebase-admin/auth";
import type { Request, RequestHandler } from "express";
import { getFirebaseServices } from "./firebase.js";

declare global {
  namespace Express {
    interface Request {
      cmsUser?: DecodedIdToken;
    }
  }
}

export type CmsRole = "admin" | "editor";

export function roleOf(user: DecodedIdToken): CmsRole | null {
  const role = user.cmsRole;
  const adminEmails = new Set((process.env.CMS_ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
  if (role === "admin" || user.cmsAdmin === true || user.admin === true || (user.email_verified === true && typeof user.email === "string" && adminEmails.has(user.email.toLowerCase()))) return "admin";
  if (role === "editor" || user.cmsEditor === true || user.editor === true) return "editor";
  return null;
}

export function requireCmsRole(...allowedRoles: CmsRole[]): RequestHandler {
  return async (request: Request, response, next) => {
    const header = request.header("authorization");
    const token = header?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
      response.status(401).json({ error: "AUTH_REQUIRED", message: "A valid sign-in is required." });
      return;
    }

    try {
      const { auth } = getFirebaseServices();
      const user = await auth.verifyIdToken(token);
      const role = roleOf(user);
      if (!role || !allowedRoles.includes(role)) {
        response.status(403).json({ error: "FORBIDDEN", message: "You do not have access to this operation." });
        return;
      }

      request.cmsUser = user;
      next();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Firebase is not configured")) {
        response.status(503).json({ error: "FIREBASE_NOT_CONFIGURED", message: "The API is not connected to Firebase yet." });
        return;
      }
      response.status(401).json({ error: "INVALID_TOKEN", message: "The sign-in token is invalid or expired." });
    }
  };
}
