import { Router, type Request, type Response } from "express";
import { requireCmsRole } from "./auth.js";
import { FieldValue, getFirebaseServices, Timestamp } from "./firebase.js";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const collectionName = "blog_posts";
const statuses = ["draft", "published"] as const;
type PostStatus = (typeof statuses)[number];
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, field: string, maxLength: number, required = false): string | undefined {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string") throw Object.assign(new Error(`${field} must be text.`), { status: 400 });
  const normalized = value.trim();
  if (required && !normalized) throw Object.assign(new Error(`${field} is required.`), { status: 400 });
  if (normalized.length > maxLength) throw Object.assign(new Error(`${field} exceeds ${maxLength} characters.`), { status: 400 });
  return normalized;
}

function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function isoDate(value: unknown): string | null {
  if (value instanceof Timestamp) return (value as Timestamp).toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ").trim();
}

function serializePost(id: string, data: JsonRecord) {
  const content = typeof data.content === "string"
    ? data.content
    : Array.isArray(data.content) ? data.content.filter((part): part is string => typeof part === "string").join("\n\n") : "";
  const summary = plainText(content).slice(0, 200);
  const seo = isRecord(data.seo) ? data.seo : {};
  return {
    id,
    title: typeof data.title === "string" ? data.title : "",
    slug: typeof data.slug === "string" ? data.slug : "",
    content,
    excerpt: summary,
    coverImage: typeof data.coverImage === "string" ? data.coverImage : typeof data.featuredImage === "string" ? data.featuredImage : "",
    mediaUrl: typeof data.mediaUrl === "string" ? data.mediaUrl : "",
    author: typeof data.author === "string" ? data.author : "Softhard",
    authorId: typeof data.authorId === "string" ? data.authorId : "",
    category: typeof data.category === "string" ? data.category : "Geral",
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
    status: data.status === "published" ? "published" : "draft",
    publishedAt: isoDate(data.publishedAt),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
    seo: {
      metaTitle: typeof seo.metaTitle === "string" ? seo.metaTitle : typeof data.title === "string" ? data.title : "",
      metaDescription: typeof seo.metaDescription === "string" ? seo.metaDescription : summary,
    },
  };
}

function parsePost(body: unknown, current?: JsonRecord) {
  if (!isRecord(body)) throw Object.assign(new Error("A JSON object is required."), { status: 400 });
  const title = text(body.title, "title", 180, current === undefined || "title" in body);
  const content = text(body.content, "content", 50000, current === undefined || "content" in body);
  const requestedSlug = text(body.slug, "slug", 120);
  const slug = requestedSlug === undefined
    ? current?.slug as string | undefined ?? (title ? slugify(title) : undefined)
    : slugify(requestedSlug);
  if (!slug) throw Object.assign(new Error("A title or slug is required."), { status: 400 });

  let status: PostStatus | undefined;
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !statuses.includes(body.status as PostStatus)) {
      throw Object.assign(new Error("status must be draft or published."), { status: 400 });
    }
    status = body.status as PostStatus;
  } else if (!current) status = "draft";

  const patch: JsonRecord = {};
  if (title !== undefined) patch.title = title;
  if (content !== undefined) patch.content = content;
  patch.slug = slug;
  if (status !== undefined) patch.status = status;

  for (const field of ["category", "coverImage", "mediaUrl"] as const) {
    if (body[field] !== undefined) {
      const value = text(body[field], field, field === "category" ? 80 : 2048);
      if (field !== "category" && value) {
        let url: URL;
        try { url = new URL(value); } catch { throw Object.assign(new Error(`${field} must be an absolute URL.`), { status: 400 }); }
        if (url.protocol !== "https:" && (field === "mediaUrl" || url.protocol !== "http:")) {
          throw Object.assign(new Error(`${field} must use HTTPS.`), { status: 400 });
        }
        if (field === "mediaUrl") {
          const host = url.hostname.toLowerCase();
          const supportedVideoHost = ["youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be", "vimeo.com", "player.vimeo.com"].includes(host);
          const directVideoFile = /\.(mp4|webm|ogg)$/i.test(url.pathname);
          if (!supportedVideoHost && !directVideoFile) {
            throw Object.assign(new Error("mediaUrl must be a YouTube, Vimeo, MP4, WebM, or Ogg URL."), { status: 400 });
          }
        }
      }
      patch[field] = value ?? "";
    }
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || body.tags.length > 20 || body.tags.some((tag) => typeof tag !== "string" || tag.trim().length > 40)) {
      throw Object.assign(new Error("tags must be an array of up to 20 short strings."), { status: 400 });
    }
    patch.tags = [...new Set(body.tags.map((tag: string) => tag.trim()).filter(Boolean))];
  }

  if (body.seo !== undefined) {
    if (!isRecord(body.seo)) throw Object.assign(new Error("seo must be an object."), { status: 400 });
    patch.seo = {
      metaTitle: text(body.seo.metaTitle, "seo.metaTitle", 70) ?? title ?? current?.title ?? "",
      metaDescription: text(body.seo.metaDescription, "seo.metaDescription", 200) ?? "",
    };
  }

  return patch;
}

async function assertUniqueSlug(slug: string, exceptId?: string) {
  const { db } = getFirebaseServices();
  const matches = await db.collection(collectionName).where("slug", "==", slug).limit(2).get();
  if (matches.docs.some((post: QueryDocumentSnapshot) => post.id !== exceptId)) {
    throw Object.assign(new Error("A post with this slug already exists."), { status: 409 });
  }
}

function routeError(response: Response, error: unknown) {
  const candidate = error as { status?: number; message?: string };
  const status = candidate.status && candidate.status >= 400 && candidate.status < 600 ? candidate.status : 500;
  if (status === 500) console.error("Posts API request failed", error instanceof Error ? error.name : "unknown error");
  response.status(status).json({
    error: status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
    message: status === 500 ? "The request could not be completed." : candidate.message,
  });
}

export const publicPostsRouter = Router();
publicPostsRouter.get("/", async (request: Request, response: Response) => {
  try {
    const { db } = getFirebaseServices();
    const snapshot = await db.collection(collectionName).where("status", "==", "published").limit(200).get();
    const category = typeof request.query.category === "string" ? request.query.category.trim() : "";
    const posts = (snapshot.docs as QueryDocumentSnapshot[]).map((post) => serializePost(post.id, post.data() as JsonRecord))
      .filter((post) => !category || post.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    response.json({ items: posts.slice(0, 100) });
  } catch (error) { routeError(response, error); }
});

publicPostsRouter.get("/:slug", async (request: Request, response: Response) => {
  try {
    const { db } = getFirebaseServices();
    const snapshot = await db.collection(collectionName).where("slug", "==", request.params.slug).limit(1).get();
    const post = snapshot.docs[0];
    if (!post || post.data().status !== "published") {
      response.status(404).json({ error: "POST_NOT_FOUND", message: "Post not found." });
      return;
    }
    response.json(serializePost(post.id, post.data() as JsonRecord));
  } catch (error) { routeError(response, error); }
});

export const adminPostsRouter = Router();
adminPostsRouter.use(requireCmsRole("admin", "editor"));

adminPostsRouter.get("/", async (request: Request, response: Response) => {
  try {
    const statusFilter = request.query.status;
    if (statusFilter !== undefined && !statuses.includes(String(statusFilter) as PostStatus)) {
      response.status(400).json({ error: "INVALID_STATUS", message: "status must be draft or published." });
      return;
    }
    const { db } = getFirebaseServices();
    const snapshot = await db.collection(collectionName).limit(200).get();
    const posts = (snapshot.docs as QueryDocumentSnapshot[]).map((post) => serializePost(post.id, post.data() as JsonRecord))
      .filter((post) => !statusFilter || post.status === statusFilter)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    response.json({ items: posts });
  } catch (error) { routeError(response, error); }
});

adminPostsRouter.post("/", async (request: Request, response: Response) => {
  try {
    const payload = parsePost(request.body);
    await assertUniqueSlug(String(payload.slug));
    const user = request.cmsUser!;
    const now = Timestamp.now();
    const { db } = getFirebaseServices();
    const record = {
      ...payload,
      author: user.name ?? user.email ?? "Softhard",
      authorId: user.uid,
      publishedAt: payload.status === "published" ? now : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const reference = await db.collection(collectionName).add(record);
    response.status(201).json(serializePost(reference.id, { ...record, createdAt: now, updatedAt: now }));
  } catch (error) { routeError(response, error); }
});

adminPostsRouter.patch("/:id", async (request: Request, response: Response) => {
  try {
    const { db } = getFirebaseServices();
    const postId = String(request.params.id);
    const reference = db.collection(collectionName).doc(postId);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      response.status(404).json({ error: "POST_NOT_FOUND", message: "Post not found." });
      return;
    }
    const current = snapshot.data() as JsonRecord;
    const patch = parsePost(request.body, current);
    await assertUniqueSlug(String(patch.slug), snapshot.id);
    if (patch.status === "published" && current.status !== "published") patch.publishedAt = Timestamp.now();
    if (patch.status === "draft") patch.publishedAt = null;
    patch.updatedAt = FieldValue.serverTimestamp();
    await reference.update(patch);
    const updated = await reference.get();
    response.json(serializePost(updated.id, updated.data() as JsonRecord));
  } catch (error) { routeError(response, error); }
});

adminPostsRouter.delete("/:id", requireCmsRole("admin"), async (request: Request, response: Response) => {
  try {
    const { db } = getFirebaseServices();
    const postId = String(request.params.id);
    const reference = db.collection(collectionName).doc(postId);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      response.status(404).json({ error: "POST_NOT_FOUND", message: "Post not found." });
      return;
    }
    await reference.delete();
    response.status(204).end();
  } catch (error) { routeError(response, error); }
});
