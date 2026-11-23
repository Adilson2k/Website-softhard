/**
 * Vercel Blob upload helpers.
 *
 * The CMS now uses Vercel Blob exclusively in every environment.
 */

import { getIdToken } from './api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const STORAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  uploadPaths: {
    blog: "cms/blog-images",
    content: "cms/content-images",
    temp: "cms/temp",
  },
};

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface UploadError {
  code: string;
  message: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await getIdToken()}` };
}

function validateFile(file: File): { valid: boolean; error?: UploadError } {
  if (file.size > STORAGE_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `File size exceeds limit of ${
          STORAGE_CONFIG.maxFileSize / 1024 / 1024
        }MB`,
      },
    };
  }

  if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: `File type ${file.type} is not allowed. Allowed types: ${STORAGE_CONFIG.allowedMimeTypes.join(
          ", "
        )}`,
      },
    };
  }

  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!STORAGE_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: {
        code: "INVALID_EXTENSION",
        message: `File extension ${extension} is not allowed`,
      },
    };
  }

  return { valid: true };
}

async function uploadViaApi(
  file: File,
  category: keyof typeof STORAGE_CONFIG.uploadPaths
): Promise<{ url: string; pathname: string }> {
  const response = await fetch(
    `${API_BASE_URL}/blob/upload?category=${encodeURIComponent(category)}`,
    {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": file.type || "application/octet-stream" },
      body: file,
    }
  );

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; filename?: string; error?: string; message?: string }
    | null;

  if (!response.ok || !payload?.url || !payload.filename) {
    throw new Error(payload?.message || payload?.error || "Blob upload API failed");
  }

  return { url: payload.url, pathname: payload.filename };
}

export async function uploadImage(
  file: File,
  category: keyof typeof STORAGE_CONFIG.uploadPaths = "blog"
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error?.message || "File validation failed");
  }

  try {
    const uploadResult = await uploadViaApi(file, category);

    return {
      url: uploadResult.url,
      filename: uploadResult.pathname,
      size: file.size,
      contentType: file.type,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to upload file to Vercel Blob: ${message}`);
  }
}

export async function uploadImages(
  files: File[],
  category: keyof typeof STORAGE_CONFIG.uploadPaths = "blog"
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadImage(file, category)));
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/blob/delete`, {
      method: "DELETE",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || "Blob delete API failed");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete file from Vercel Blob: ${message}`);
  }
}

export function isStorageConfigured(): boolean {
  return true;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
