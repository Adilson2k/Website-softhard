const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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
