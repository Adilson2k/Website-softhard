const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  mediaUrl?: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
};

export type LeadSubmission = {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  interest: string;
  message: string;
  sourcePage: string;
  website?: string;
};

async function responseError(response: Response, fallback: string): Promise<Error> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
      return new Error(data.message);
    }
  } catch {
    // Use a generic error when the API response isn't JSON.
  }
  return new Error(fallback);
}

export async function getApiHealth(signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/api/health`, { signal });

  if (!response.ok) {
    throw new Error(`API health check failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    typeof data.status !== "string"
  ) {
    throw new Error("API returned an invalid health response");
  }

  return { status: data.status };
}

export async function getPublicPosts(signal?: AbortSignal): Promise<PublicPost[]> {
  const response = await fetch(`${API_URL}/api/posts`, { signal });
  if (!response.ok) throw await responseError(response, "Could not load the news.");
  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || !("items" in data) || !Array.isArray(data.items)) {
    throw new Error("The API returned an invalid posts response.");
  }
  return data.items.filter((item): item is PublicPost =>
    typeof item === "object" && item !== null &&
    "id" in item && typeof item.id === "string" &&
    "title" in item && typeof item.title === "string" &&
    "slug" in item && typeof item.slug === "string" &&
    "content" in item && typeof item.content === "string" &&
    "category" in item && typeof item.category === "string",
  );
}

export async function submitLead(payload: LeadSubmission): Promise<void> {
  const response = await fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await responseError(response, "Could not send your message.");
}
