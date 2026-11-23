import { del, put } from "@vercel/blob";
import { Router, type Request, type Response } from "express";
import { requireCmsRole } from "./auth.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const allowedCategories = new Set(["blog", "content", "temp"]);
const maxUploadBytes = 10 * 1024 * 1024;

function fail(response: Response, status: number, error: string, message: string) {
  response.status(status).json({ error, message });
}

function blobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw Object.assign(new Error("Blob storage is not configured."), { status: 503 });
  return token;
}

export const blobRouter = Router();
blobRouter.use(requireCmsRole("admin", "editor"));

blobRouter.post("/upload", async (request: Request, response: Response) => {
  try {
    const contentType = request.header("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    const category = typeof request.query.category === "string" ? request.query.category : "blog";
    if (!allowedTypes.has(contentType)) {
      fail(response, 415, "INVALID_FILE_TYPE", "Only JPEG, PNG, WebP, and GIF images are accepted.");
      return;
    }
    if (!allowedCategories.has(category)) {
      fail(response, 400, "INVALID_CATEGORY", "Unknown upload category.");
      return;
    }
    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      fail(response, 400, "EMPTY_FILE", "Choose a non-empty image to upload.");
      return;
    }
    if (request.body.length > maxUploadBytes) {
      fail(response, 413, "FILE_TOO_LARGE", "Images must be 10 MB or smaller.");
      return;
    }

    const extension = contentType === "image/jpeg" ? "jpg" : contentType.slice("image/".length);
    const blob = await put(`softhard/${category}/${crypto.randomUUID()}.${extension}`, request.body, {
      access: "public",
      token: blobToken(),
      contentType,
    });
    response.status(201).json({ url: blob.url, filename: blob.pathname, size: request.body.length, contentType, uploadedAt: new Date().toISOString() });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    if (status === 500) console.error("Blob upload failed", error instanceof Error ? error.name : "unknown error");
    fail(response, status, status === 503 ? "BLOB_NOT_CONFIGURED" : "UPLOAD_FAILED", status < 500 && error instanceof Error ? error.message : "The image could not be uploaded.");
  }
});

blobRouter.delete("/delete", async (request: Request, response: Response) => {
  try {
    const urlValue = request.body && typeof request.body.url === "string" ? request.body.url : "";
    let url: URL;
    try { url = new URL(urlValue); } catch {
      fail(response, 400, "INVALID_BLOB_URL", "A valid Blob URL is required.");
      return;
    }
    if (url.protocol !== "https:" || !url.hostname.endsWith(".public.blob.vercel-storage.com")) {
      fail(response, 400, "INVALID_BLOB_URL", "Only public Vercel Blob images can be deleted.");
      return;
    }
    await del(url.toString(), { token: blobToken() });
    response.status(204).end();
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    if (status === 500) console.error("Blob deletion failed", error instanceof Error ? error.name : "unknown error");
    fail(response, status, status === 503 ? "BLOB_NOT_CONFIGURED" : "DELETE_FAILED", status < 500 && error instanceof Error ? error.message : "The image could not be deleted.");
  }
});
