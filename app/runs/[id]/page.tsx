import Link from "next/link";
import { AssetUploadForm } from "@/components/AssetUploadForm";
import { MediaPreviewGrid } from "@/components/MediaPreviewGrid";
import { PipelineStepper } from "@/components/PipelineStepper";
import { RunActions } from "@/components/RunActions";
import { RunLivePoller } from "@/components/RunLivePoller";
import { SceneTimeline } from "@/components/SceneTimeline";
import { StepEditor } from "@/components/StepEditor";
import { getCreativeRun } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import {
  findFinalVideoUrl,
  findIntroMs,
  findNarrationUrl,
  findSceneImages,
  findScriptScenes,
  findSubtitles,
  findSupervisor,
  findVideoClips,
  parseStepOutput,
} from "@/lib/run-parsers";

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
  const videoSrc = mediaUrl(findFinalVideoUrl(steps));
  const clips = findVideoClips(steps);
  const images = findSceneImages(steps);
  const scenes = findScriptScenes(steps);
  const subs = findSubtitles(steps);
  const supervisor = findSupervisor(steps);
  const assets = run.inputAssets;
  const hasIntro = Boolean(assets?.introClip);
  const introMs = findIntroMs(steps, hasIntro);
  const narrationUrl = findNarrationUrl(steps);
  const canUpload =
    run.status === "draft" ||
    run.status === "failed" ||
    run.status === "needs_review" ||
    run.status === "approved";

  return (
    <div className="run-detail">
      <Link href="/runs">← Back to runs</Link>

      <header className="run-header">
        <div>
          <h1>Run {run.id.slice(0, 8)}</h1>
          <p className="muted">
            <span className={`badge badge-${run.status}`}>{run.status}</span>
            {" · "}
            {run.imageProvider} / {run.videoProvider}
            {run.hook ? ` · "${run.hook}"` : ""}
          </p>
        </div>
        <RunActions runId={run.id} status={run.status} />
      </header>

      <RunLivePoller runId={run.id} status={run.status} />

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Pipeline progress</h2>
        <PipelineStepper steps={steps} />
      </section>

      {scenes.length > 0 ? (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Scene timeline</h2>
          <SceneTimeline scenes={scenes} introMs={introMs} />
        </section>
      ) : null}

      {videoSrc ? (
        <section className="card final-video-card">
          <h2>Final creative</h2>
          <video src={videoSrc} controls playsInline />
          <p className="muted">9:16 UGC output</p>
        </section>
      ) : null}

      <MediaPreviewGrid
        images={images}
        clips={clips}
        narrationUrl={narrationUrl}
        imageProvider={run.imageProvider}
        videoProvider={run.videoProvider}
      />

      {subs ? (
        <p className="muted">
          Subtitles: {subs.source ?? "unknown"}
          {subs.srtUrl ? (
            <>
              {" "}
              ·{" "}
              <a href={mediaUrl(subs.srtUrl) ?? "#"} target="_blank" rel="noreferrer">
                Download SRT
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {supervisor ? (
        <section className="card qa-card">
          <h2>Quality review</h2>
          {supervisor.qualityScore != null ? (
            <p>
              Score: <strong>{supervisor.qualityScore}</strong>
              {supervisor.approved != null ? (
                <span className={`badge badge-${supervisor.approved ? "done" : "failed"}`}>
                  {supervisor.approved ? "pass" : "fail"}
                </span>
              ) : null}
            </p>
          ) : null}
          {supervisor.issues?.length ? (
            <ul className="muted">
              {supervisor.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Input assets</h2>
        <AssetUploadForm runId={run.id} disabled={!canUpload} />
        {assets ? (
          <ul className="muted asset-list">
            {assets.personaImage ? <li>Persona: {assets.personaImage}</li> : null}
            {assets.productImage ? <li>Product: {assets.productImage}</li> : null}
            {assets.introClip ? <li>Intro clip: {assets.introClip}</li> : null}
          </ul>
        ) : null}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Step outputs</h2>
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
              const out = parseStepOutput(step);
              const preview = out
                ? JSON.stringify(out, null, 0).slice(0, 100) +
                  (JSON.stringify(out).length > 100 ? "…" : "")
                : "—";
              return (
                <tr key={step.id}>
                  <td>{step.stepOrder}</td>
                  <td>{step.stepType}</td>
                  <td>
                    <span className={`badge badge-${step.status}`}>{step.status}</span>
                  </td>
                  <td className="step-output-cell">
                    <code>{preview}</code>
                    <StepEditor runId={run.id} step={step} runStatus={run.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
