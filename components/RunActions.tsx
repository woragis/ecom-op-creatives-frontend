"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Props = {
  runId: string;
  status: string;
};

export function RunActions({ runId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/creative-runs/${runId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setLoading(false);
    }
  }

  if (status !== "needs_review" && status !== "approved") {
    return null;
  }

  return (
    <div className="run-actions">
      {status === "needs_review" ? (
        <button type="button" onClick={() => void approve()} disabled={loading}>
          Approve creative
        </button>
      ) : (
        <span className="badge badge-approved">Approved</span>
      )}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
