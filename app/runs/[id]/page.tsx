import Link from "next/link";
import { getCreativeRun } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { PipelineStep } from "@/lib/types";

function parseOutput(step: PipelineStep): Record<string, unknown> | null {
  if (!step.outputJson) return null;
  if (typeof step.outputJson === "object") {
    return step.outputJson as Record<string, unknown>;
  }
  return null;
}

function findFinalVideo(steps: PipelineStep[]): string | null {
  const post = steps.find((s) => s.stepType === "postprocess" && s.status === "done");
  const out = post ? parseOutput(post) : null;
  const url = out?.finalVideoUrl;
  return typeof url === "string" ? mediaUrl(url) : null;
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let run = null;
  let error: string | null = null;

  try {
    run = await getCreativeRun(id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load run";
  }

  if (error) {
    return (
      <div>
        <Link href="/runs">← Back</Link>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!run) return null;

  const steps = run.steps ?? [];
  const videoSrc = findFinalVideo(steps);

  return (
    <div>
      <Link href="/runs">← Back to runs</Link>
      <h1>Run {run.id.slice(0, 8)}</h1>
      <p className="muted">
        Status: <span className={`badge badge-${run.status}`}>{run.status}</span> ·
        Provider: {run.videoProvider}
      </p>

      {videoSrc ? (
        <div className="card" style={{ marginTop: "1.5rem", maxWidth: 360 }}>
          <h2>Final creative</h2>
          <video
            src={videoSrc}
            controls
            style={{ width: "100%", borderRadius: 12, background: "#000" }}
          />
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            9:16 UGC preview
          </p>
        </div>
      ) : null}

      <h2 style={{ marginTop: "2rem" }}>Pipeline</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Step</th>
            <th>Status</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => {
            const out = parseOutput(step);
            const preview = out
              ? JSON.stringify(out, null, 0).slice(0, 120) +
                (JSON.stringify(out).length > 120 ? "…" : "")
              : "—";
            return (
              <tr key={step.id}>
                <td>{step.stepOrder}</td>
                <td>{step.stepType}</td>
                <td>{step.status}</td>
                <td className="muted" style={{ fontSize: "0.8rem", maxWidth: 420 }}>
                  <code>{preview}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
