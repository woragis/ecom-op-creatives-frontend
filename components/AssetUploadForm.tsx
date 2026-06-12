"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Props = {
  runId: string;
  disabled?: boolean;
};

export function AssetUploadForm({ runId, disabled }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(assetType: string, file: File) {
    setUploading(assetType);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(
        `${API_URL}/v1/creative-runs/${runId}/assets/${assetType}`,
        { method: "POST", body: fd }
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="form" style={{ maxWidth: 520 }}>
      <p className="muted">
        Upload persona, product, or intro clip. On completed runs, replacing an asset
        automatically reprocesses from image (persona/product) or render (intro).
      </p>
      {(["persona", "product", "intro"] as const).map((type) => (
        <label key={type} style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ textTransform: "capitalize" }}>{type} file</span>
          <input
            type="file"
            accept={type === "intro" ? "video/*" : "image/*"}
            disabled={disabled || uploading !== null}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(type, file);
              e.target.value = "";
            }}
          />
          {uploading === type ? <span className="muted">Uploading…</span> : null}
        </label>
      ))}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
