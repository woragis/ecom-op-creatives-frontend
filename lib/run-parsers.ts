import type { PipelineStep } from "./types";

export function parseStepOutput(step: PipelineStep): Record<string, unknown> | null {
  if (!step.outputJson || typeof step.outputJson !== "object") return null;
  return step.outputJson as Record<string, unknown>;
}

export type VideoClip = {
  sceneId: string;
  publicUrl: string;
  provider: string;
  mode?: string;
};

export type SceneImage = {
  sceneId: string;
  role: string;
  publicUrl: string;
  source: string;
};

export type ScriptScene = {
  id: string;
  startMs: number;
  endMs: number;
  narration: string;
  emotion?: string;
};

export type SupervisorSummary = {
  qualityScore?: number;
  approved?: boolean;
  issues?: string[];
};

export function findVideoClips(steps: PipelineStep[]): VideoClip[] {
  const video = steps.find((s) => s.stepType === "video" && s.status === "done");
  const clips = video ? parseStepOutput(video)?.clips : null;
  if (!Array.isArray(clips)) return [];
  return clips.filter(
    (c): c is VideoClip =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as VideoClip).sceneId === "string" &&
      typeof (c as VideoClip).publicUrl === "string"
  );
}

export function findSceneImages(steps: PipelineStep[]): SceneImage[] {
  const image = steps.find((s) => s.stepType === "image" && s.status === "done");
  const images = image ? parseStepOutput(image)?.images : null;
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img): img is SceneImage =>
      typeof img === "object" &&
      img !== null &&
      typeof (img as SceneImage).sceneId === "string" &&
      typeof (img as SceneImage).publicUrl === "string"
  );
}

export function findScriptScenes(steps: PipelineStep[]): ScriptScene[] {
  const script = steps.find((s) => s.stepType === "script" && s.status === "done");
  const scenes = script ? parseStepOutput(script)?.scenes : null;
  if (!Array.isArray(scenes)) return [];
  return scenes
    .filter((s): s is ScriptScene => typeof s === "object" && s !== null && "id" in s)
    .map((s) => ({
      id: String((s as ScriptScene).id),
      startMs: Number((s as ScriptScene).startMs ?? 0),
      endMs: Number((s as ScriptScene).endMs ?? 0),
      narration: String((s as ScriptScene).narration ?? ""),
      emotion: (s as ScriptScene).emotion,
    }));
}

export function findSubtitles(steps: PipelineStep[]) {
  const sub = steps.find((s) => s.stepType === "subtitles" && s.status === "done");
  const out = sub ? parseStepOutput(sub) : null;
  if (!out) return null;
  const srtUrl = typeof out.srtUrl === "string" ? out.srtUrl : undefined;
  const source = typeof out.source === "string" ? out.source : undefined;
  if (!srtUrl && !source) return null;
  return { srtUrl, source };
}

export function findNarrationUrl(steps: PipelineStep[]): string | undefined {
  const voice = steps.find((s) => s.stepType === "voice" && s.status === "done");
  const url = voice ? parseStepOutput(voice)?.publicUrl : undefined;
  return typeof url === "string" ? url : undefined;
}

export function findFinalVideoUrl(steps: PipelineStep[]): string | undefined {
  const post = steps.find((s) => s.stepType === "postprocess" && s.status === "done");
  const url = post ? parseStepOutput(post)?.finalVideoUrl : undefined;
  return typeof url === "string" ? url : undefined;
}

export function findIntroMs(steps: PipelineStep[], hasIntroClip: boolean): number {
  const render = steps.find((s) => s.stepType === "render" && s.status === "done");
  const ms = render ? parseStepOutput(render)?.introDurationMs : undefined;
  if (typeof ms === "number" && ms > 0) return ms;
  return hasIntroClip ? 2500 : 0;
}

export function findSupervisor(steps: PipelineStep[]): SupervisorSummary | null {
  const sup = steps.find((s) => s.stepType === "supervisor" && s.status === "done");
  const out = sup ? parseStepOutput(sup) : null;
  if (!out) return null;
  return {
    qualityScore: typeof out.qualityScore === "number" ? out.qualityScore : undefined,
    approved: typeof out.approved === "boolean" ? out.approved : undefined,
    issues: Array.isArray(out.issues) ? (out.issues as string[]) : undefined,
  };
}

export function formatMs(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
