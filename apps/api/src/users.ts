import { Router } from "express";
import type { UserRecord } from "firebase-admin/auth";
import { requireCmsRole } from "./auth.js";
import { getFirebaseServices } from "./firebase.js";

export const adminUsersRouter = Router();
adminUsersRouter.use(requireCmsRole("admin"));

function serializeUser(user: UserRecord) {
  const email = user.email ?? null;
  const adminEmails = new Set((process.env.CMS_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean));
  const claims = user.customClaims ?? {};
  const role = claims.cmsRole === "admin" || claims.cmsAdmin === true || claims.admin === true || (user.emailVerified && email && adminEmails.has(email.toLowerCase()))
    ? "admin"
    : claims.cmsRole === "editor" || claims.cmsEditor === true || claims.editor === true ? "editor" : null;
  return {
    uid: user.uid,
    email,
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? null,
    disabled: user.disabled,
    role,
    createdAt: user.metadata.creationTime,
  };
}

adminUsersRouter.get("/", async (_request, response) => {
  try {
    const { auth } = getFirebaseServices();
    const result = await auth.listUsers(1000);
    response.json({ items: result.users.map(serializeUser).sort((a, b) => (a.email ?? "").localeCompare(b.email ?? "")) });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    if (status === 500) console.error("Admin users list failed", error instanceof Error ? error.name : "unknown error");
    response.status(status).json({ error: status === 400 ? "INVALID_REQUEST" : "INTERNAL_ERROR", message: status === 400 && error instanceof Error ? error.message : "The user list could not be loaded." });
  }
});

adminUsersRouter.post("/", async (request, response) => {
  const body = request.body as Record<string, unknown>;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "INVALID_REQUEST", message: "A JSON object is required." });
    return;
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role;

  if (displayName.length < 2 || displayName.length > 100) {
    response.status(400).json({ error: "INVALID_REQUEST", message: "Enter a name between 2 and 100 characters." });
    return;
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: "INVALID_REQUEST", message: "Enter a valid email address." });
    return;
  }
  if (password.length < 12 || password.length > 128) {
    response.status(400).json({ error: "INVALID_REQUEST", message: "The initial password must contain at least 12 characters." });
    return;
  }
  if (role !== "admin" && role !== "editor") {
    response.status(400).json({ error: "INVALID_REQUEST", message: "Role must be admin or editor." });
    return;
  }

  const { auth } = getFirebaseServices();
  let createdUid: string | undefined;
  try {
    const created = await auth.createUser({ email, displayName, password, emailVerified: false });
    createdUid = created.uid;
    await auth.setCustomUserClaims(created.uid, { cmsRole: role });
    const user = await auth.getUser(created.uid);
    response.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    if (createdUid) {
      await auth.deleteUser(createdUid).catch(() => undefined);
    }
    const code = (error as { code?: string }).code;
    const status = code === "auth/email-already-exists" ? 409 : code?.startsWith("auth/invalid-") || code === "auth/weak-password" ? 400 : 500;
    if (status === 500) console.error("Admin user creation failed", error instanceof Error ? error.name : "unknown error");
    response.status(status).json({
      error: status === 409 ? "EMAIL_ALREADY_EXISTS" : status === 400 ? "INVALID_USER" : "INTERNAL_ERROR",
      message: status === 409 ? "An account with this email already exists." : status === 400 ? "The Firebase account details are invalid." : "The account could not be created.",
    });
  }
});
