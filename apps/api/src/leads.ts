import { Router, type Request, type Response } from "express";
import { requireCmsRole } from "./auth.js";
import { FieldValue, getFirebaseServices, Timestamp } from "./firebase.js";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const collectionName = "leads";
const leadStatuses = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
type LeadStatus = (typeof leadStatuses)[number];
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: unknown, field: string, max: number, required = false): string | undefined {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string") throw Object.assign(new Error(`${field} must be text.`), { status: 400 });
  const result = value.trim();
  if (required && result.length === 0) throw Object.assign(new Error(`${field} is required.`), { status: 400 });
  if (result.length > max) throw Object.assign(new Error(`${field} exceeds ${max} characters.`), { status: 400 });
  return result;
}

function serializeLead(id: string, data: JsonRecord) {
  const asIso = (value: unknown) => {
    if (value instanceof Timestamp) return (value as Timestamp).toDate().toISOString();
    return null;
  };
  const activity = Array.isArray(data.activity)
    ? data.activity.filter(isRecord).map((event) => ({ ...event, at: asIso(event.at) }))
    : [];
  return {
    id,
    name: data.name,
    email: data.email,
    company: data.company ?? null,
    phone: data.phone ?? null,
    interest: data.interest,
    message: data.message,
    sourcePage: data.sourcePage ?? null,
    status: data.status,
    assignedTo: data.assignedTo ?? null,
    nextStep: data.nextStep ?? null,
    followUpAt: asIso(data.followUpAt),
    activity,
    createdAt: asIso(data.createdAt),
    updatedAt: asIso(data.updatedAt),
  };
}

function handleError(response: Response, error: unknown) {
  const candidate = error as { status?: number; message?: string };
  const status = candidate.status && candidate.status >= 400 && candidate.status < 600 ? candidate.status : 500;
  if (status === 500) console.error("Leads API request failed", error instanceof Error ? error.name : "unknown error");
  response.status(status).json({
    error: status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
    message: status === 500 ? "The request could not be completed." : candidate.message,
  });
}

export const publicLeadsRouter = Router();
publicLeadsRouter.post("/", async (request: Request, response: Response) => {
  try {
    if (!isRecord(request.body)) {
      response.status(400).json({ error: "INVALID_BODY", message: "A JSON object is required." });
      return;
    }

    // Quietly discard bot submissions caught by the hidden form field.
    if (typeof request.body.website === "string" && request.body.website.trim()) {
      response.status(202).json({ received: true });
      return;
    }

    const name = stringField(request.body.name, "name", 120, true)!;
    const email = stringField(request.body.email, "email", 254, true)!.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      response.status(400).json({ error: "INVALID_EMAIL", message: "Enter a valid email address." });
      return;
    }
    const company = stringField(request.body.organization ?? request.body.company, "organization", 160);
    const phone = stringField(request.body.phone, "phone", 40);
    const interest = stringField(request.body.interest, "interest", 120, true)!;
    const message = stringField(request.body.message, "message", 5000, true)!;
    if (message.length < 10) {
      response.status(400).json({ error: "MESSAGE_TOO_SHORT", message: "Add a little more detail to your message." });
      return;
    }
    const sourcePage = stringField(request.body.sourcePage, "sourcePage", 300)
      ?? stringField(request.get("referer"), "referer", 500);

    const { db } = getFirebaseServices();
    const now = Timestamp.now();
    const reference = await db.collection(collectionName).add({
      name,
      email,
      company: company || null,
      phone: phone || null,
      interest,
      message,
      sourcePage: sourcePage || null,
      status: "new" satisfies LeadStatus,
      assignedTo: null,
      nextStep: null,
      followUpAt: null,
      activity: [{ type: "created", at: now, by: "website" }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    response.status(201).json({ id: reference.id, received: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Firebase is not configured")) {
      response.status(503).json({ error: "FIREBASE_NOT_CONFIGURED", message: "The contact form is temporarily unavailable." });
      return;
    }
    handleError(response, error);
  }
});

export const adminLeadsRouter = Router();
adminLeadsRouter.use(requireCmsRole("admin"));

adminLeadsRouter.get("/", async (request: Request, response: Response) => {
  try {
    const statusFilter = request.query.status;
    if (statusFilter !== undefined && !leadStatuses.includes(String(statusFilter) as LeadStatus)) {
      response.status(400).json({ error: "INVALID_STATUS", message: "Unknown lead status." });
      return;
    }
    const limit = Math.min(Math.max(Number(request.query.limit) || 50, 1), 100);
    const { db } = getFirebaseServices();
    const snapshot = await db.collection(collectionName).limit(500).get();
    const items = (snapshot.docs as QueryDocumentSnapshot[]).map((lead) => serializeLead(lead.id, lead.data() as JsonRecord))
      .filter((lead) => !statusFilter || lead.status === statusFilter)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, limit);
    response.json({ items });
  } catch (error) { handleError(response, error); }
});

adminLeadsRouter.get("/:id", async (request: Request, response: Response) => {
  try {
    const { db } = getFirebaseServices();
    const leadId = String(request.params.id);
    const snapshot = await db.collection(collectionName).doc(leadId).get();
    if (!snapshot.exists) {
      response.status(404).json({ error: "LEAD_NOT_FOUND", message: "Lead not found." });
      return;
    }
    response.json(serializeLead(snapshot.id, snapshot.data() as JsonRecord));
  } catch (error) { handleError(response, error); }
});

adminLeadsRouter.patch("/:id", async (request: Request, response: Response) => {
  try {
    if (!isRecord(request.body)) {
      response.status(400).json({ error: "INVALID_BODY", message: "A JSON object is required." });
      return;
    }

    const { db } = getFirebaseServices();
    const leadId = String(request.params.id);
    const reference = db.collection(collectionName).doc(leadId);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      response.status(404).json({ error: "LEAD_NOT_FOUND", message: "Lead not found." });
      return;
    }
    const current = snapshot.data() as JsonRecord;
    const update: JsonRecord = { updatedAt: FieldValue.serverTimestamp() };
    const activity: JsonRecord = {
      type: "updated",
      at: Timestamp.now(),
      by: request.cmsUser?.email ?? request.cmsUser?.uid ?? "admin",
    };

    if (request.body.status !== undefined) {
      if (typeof request.body.status !== "string" || !leadStatuses.includes(request.body.status as LeadStatus)) {
        response.status(400).json({ error: "INVALID_STATUS", message: "Unknown lead status." });
        return;
      }
      const currentStatus = current.status as LeadStatus;
      const nextStatus = request.body.status as LeadStatus;
      const transitions: Record<LeadStatus, LeadStatus[]> = {
        new: ["contacted", "lost"],
        contacted: ["qualified", "lost"],
        qualified: ["contacted", "proposal", "lost"],
        proposal: ["qualified", "won", "lost"],
        won: [],
        lost: ["new"],
      };
      if (nextStatus !== currentStatus && !transitions[currentStatus]?.includes(nextStatus)) {
        response.status(409).json({ error: "INVALID_TRANSITION", message: `Cannot move a lead from ${currentStatus} to ${nextStatus}.` });
        return;
      }
      update.status = nextStatus;
      activity.status = nextStatus;
    }

    if ("assignedTo" in request.body) {
      update.assignedTo = stringField(request.body.assignedTo, "assignedTo", 160) || null;
      activity.assignedTo = update.assignedTo;
    }
    if ("nextStep" in request.body) {
      update.nextStep = stringField(request.body.nextStep, "nextStep", 500) || null;
      activity.nextStep = update.nextStep;
    }
    if ("followUpAt" in request.body) {
      const value = stringField(request.body.followUpAt, "followUpAt", 40);
      if (!value) {
        update.followUpAt = null;
        activity.followUpAt = null;
      }
      else {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          response.status(400).json({ error: "INVALID_FOLLOW_UP_DATE", message: "followUpAt must be an ISO date." });
          return;
        }
        update.followUpAt = Timestamp.fromDate(date);
        activity.followUpAt = date.toISOString();
      }
    }
    if ("note" in request.body) {
      const note = stringField(request.body.note, "note", 2000, true)!;
      activity.note = note;
    }

    if (Object.keys(activity).length <= 3) {
      response.status(400).json({ error: "EMPTY_UPDATE", message: "Provide a status, assignment, next step, follow-up date, or note." });
      return;
    }
    update.activity = FieldValue.arrayUnion(activity);
    await reference.update(update);
    const updated = await reference.get();
    response.json(serializeLead(updated.id, updated.data() as JsonRecord));
  } catch (error) { handleError(response, error); }
});
