import Link from "next/link";
import { AssetUploadForm } from "@/components/AssetUploadForm";
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

type VideoClip = { sceneId: string; publicUrl: string; provider: string; mode?: string };
type SceneImage = { sceneId: string; role: string; publicUrl: string; source: string };

function findVideoClips(steps: PipelineStep[]): VideoClip[] {
  const video = steps.find((s) => s.stepType === "video" && s.status === "done");
  const out = video ? parseOutput(video) : null;
  const clips = out?.clips;
  if (!Array.isArray(clips)) return [];
  return clips.filter(
    (c): c is VideoClip =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as VideoClip).sceneId === "string" &&
      typeof (c as VideoClip).publicUrl === "string"
  );
}

function findSceneImages(steps: PipelineStep[]): SceneImage[] {
  const image = steps.find((s) => s.stepType === "image" && s.status === "done");
  const out = image ? parseOutput(image) : null;
  const images = out?.images;
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img): img is SceneImage =>
      typeof img === "object" &&
      img !== null &&
      typeof (img as SceneImage).sceneId === "string" &&
      typeof (img as SceneImage).publicUrl === "string"
  );
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
  const clips = findVideoClips(steps);
  const images = findSceneImages(steps);
  const assets = run.inputAssets;
  const canUpload = run.status === "draft" || run.status === "failed";

  return (
    <div>
      <Link href="/runs">← Back to runs</Link>
      <h1>Run {run.id.slice(0, 8)}</h1>
      <p className="muted">
        Status: <span className={`badge badge-${run.status}`}>{run.status}</span> ·
        Image: {run.imageProvider} · Video: {run.videoProvider}
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <h2>Input assets</h2>
        <AssetUploadForm runId={run.id} disabled={!canUpload} />
        {assets ? (
          <ul className="muted" style={{ marginTop: "1rem" }}>
            {assets.personaImage ? <li>Persona: {assets.personaImage}</li> : null}
            {assets.productImage ? <li>Product: {assets.productImage}</li> : null}
            {assets.introClip ? <li>Intro clip: {assets.introClip}</li> : null}
          </ul>
        ) : null}
      </div>

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

      {images.length > 0 ? (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>Scene images ({run.imageProvider})</h2>
          <div className="card-grid">
            {images.map((img) => (
              <div key={`${img.sceneId}-${img.role}`} className="card">
                <h3>
                  {img.sceneId} · {img.role}
                </h3>
                <p className="muted">{img.source}</p>
                <a href={mediaUrl(img.publicUrl) ?? "#"} target="_blank" rel="noreferrer">
                  View image
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {clips.length > 0 ? (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>AI video clips ({run.videoProvider})</h2>
          <div className="card-grid">
            {clips.map((clip) => (
              <div key={clip.sceneId} className="card">
                <h3>{clip.sceneId}</h3>
                {clip.mode ? <p className="muted">{clip.mode}</p> : null}
                <a href={mediaUrl(clip.publicUrl) ?? "#"} target="_blank" rel="noreferrer">
                  Download clip
                </a>
              </div>
            ))}
          </div>
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
