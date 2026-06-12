import type { CreativeRun, Product } from "./types";

function apiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8080"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listProducts(): Promise<Product[]> {
  const data = await apiFetch<{ items: Product[] }>("/v1/products");
  return data.items ?? [];
}

export async function listCreativeRuns(): Promise<CreativeRun[]> {
  const data = await apiFetch<{ items: CreativeRun[] }>("/v1/creative-runs");
  return data.items ?? [];
}

export async function getCreativeRun(id: string): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(`/v1/creative-runs/${id}`);
}

export async function createProduct(input: {
  name: string;
  description?: string;
  url?: string;
  niche?: string;
}): Promise<Product> {
  return apiFetch<Product>("/v1/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createCreativeRun(input: {
  productId: string;
  hook?: string;
  videoProvider?: string;
  imageProvider?: string;
}): Promise<CreativeRun> {
  return apiFetch<CreativeRun>("/v1/creative-runs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function startCreativeRun(id: string): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(`/v1/creative-runs/${id}/start`, {
    method: "POST",
  });
}

export async function editRunStep(
  runId: string,
  stepId: string,
  outputJson: unknown,
  reprocess = true
): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(`/v1/creative-runs/${runId}/steps/${stepId}`, {
    method: "PATCH",
    body: JSON.stringify({ outputJson, reprocess }),
  });
}

export async function reprocessRun(
  runId: string,
  fromStepType: string
): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(`/v1/creative-runs/${runId}/reprocess`, {
    method: "POST",
    body: JSON.stringify({ fromStepType }),
  });
}

export async function approveRun(runId: string): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(`/v1/creative-runs/${runId}/approve`, {
    method: "POST",
  });
}

export async function continueRun(runId: string): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(`/v1/creative-runs/${runId}/continue`, {
    method: "POST",
  });
}

export async function retryStep(runId: string, stepId: string): Promise<CreativeRun> {
  return apiFetch<CreativeRun>(
    `/v1/creative-runs/${runId}/steps/${stepId}/retry`,
    { method: "POST" }
  );
}

export type VideoProvider = {
  id: string;
  configured: boolean;
  isDefault: boolean;
};

export async function listVideoProviders(): Promise<VideoProvider[]> {
  const data = await apiFetch<{ items: VideoProvider[] }>("/v1/video-providers");
  return data.items ?? [];
}

export type ImageProvider = VideoProvider;

export async function listImageProviders(): Promise<ImageProvider[]> {
  const data = await apiFetch<{ items: ImageProvider[] }>("/v1/image-providers");
  return data.items ?? [];
}
