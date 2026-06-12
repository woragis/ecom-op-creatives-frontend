"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PipelineStep } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Props = {
  runId: string;
  step: PipelineStep;
  runStatus: string;
};

export function StepRetryButton({ runId, step, runStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (step.status !== "failed" || runStatus === "running") {
    return null;
  }

  async function retry() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/v1/creative-runs/${runId}/steps/${step.id}/retry`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="button-secondary"
      onClick={() => void retry()}
      disabled={loading}
      style={{ marginTop: "0.35rem" }}
    >
      Retry step
    </button>
  );
}
