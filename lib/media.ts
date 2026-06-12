const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function mediaUrl(path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
