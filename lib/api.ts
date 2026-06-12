import type { CreativeRun, Product } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
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
