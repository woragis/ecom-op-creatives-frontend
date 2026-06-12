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

export function StepEditor({ runId, step, runStatus }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable =
    step.status === "done" &&
    runStatus !== "running" &&
    ["needs_review", "approved", "failed"].includes(runStatus);

  function loadEditor() {
    const out = step.outputJson;
    const text =
      out && typeof out === "object"
        ? JSON.stringify(out, null, 2)
        : "{}";
    setJsonText(text);
    setOpen(true);
    setError(null);
  }

  async function save(reprocess: boolean) {
    setSaving(true);
    setError(null);
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const res = await fetch(
        `${API_URL}/v1/creative-runs/${runId}/steps/${step.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outputJson: parsed, reprocess }),
        }
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function reprocessFromHere() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/creative-runs/${runId}/reprocess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromStepType: step.stepType }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reprocess failed");
    } finally {
      setSaving(false);
    }
  }

  if (!editable && step.status !== "done") {
    return null;
  }

  return (
    <div style={{ marginTop: "0.35rem" }}>
      {editable ? (
        <button type="button" onClick={loadEditor} disabled={saving}>
          Edit output
        </button>
      ) : null}
      {editable && step.status === "done" ? (
        <button
          type="button"
          style={{ marginLeft: "0.5rem" }}
          onClick={() => void reprocessFromHere()}
          disabled={saving}
        >
          Reprocess from here
        </button>
      ) : null}
      {open ? (
        <div className="card" style={{ marginTop: "0.75rem" }}>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              background: "#0f1528",
              color: "#e8ecf8",
              border: "1px solid #24304d",
              borderRadius: 8,
              padding: "0.5rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={() => void save(true)} disabled={saving}>
              Save &amp; reprocess
            </button>
            <button type="button" onClick={() => void save(false)} disabled={saving}>
              Save only
            </button>
            <button type="button" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
