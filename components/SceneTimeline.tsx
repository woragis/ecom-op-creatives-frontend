import { formatMs, type ScriptScene } from "@/lib/run-parsers";

type Props = {
  scenes: ScriptScene[];
  introMs?: number;
};

export function SceneTimeline({ scenes, introMs = 0 }: Props) {
  if (scenes.length === 0) return null;

  const totalEnd = Math.max(
    introMs,
    ...scenes.map((s) => s.startMs + introMs + (s.endMs - s.startMs))
  );

  return (
    <div className="timeline">
      {introMs > 0 ? (
        <div className="timeline-row">
          <div className="timeline-meta">
            <strong>intro</strong>
            <span className="muted">user clip</span>
          </div>
          <div className="timeline-track">
            <div
              className="timeline-bar timeline-bar-intro"
              style={{ width: `${(introMs / totalEnd) * 100}%` }}
            />
          </div>
          <span className="timeline-time">{formatMs(introMs)}</span>
        </div>
      ) : null}
      {scenes.map((scene) => {
        const start = scene.startMs + introMs;
        const duration = scene.endMs - scene.startMs;
        const widthPct = (duration / totalEnd) * 100;
        const leftPct = (start / totalEnd) * 100;
        return (
          <div key={scene.id} className="timeline-row">
            <div className="timeline-meta">
              <strong>{scene.id}</strong>
              {scene.emotion ? <span className="muted">{scene.emotion}</span> : null}
            </div>
            <div className="timeline-track">
              <div
                className="timeline-bar"
                style={{ width: `${widthPct}%`, marginLeft: `${leftPct}%` }}
                title={scene.narration}
              />
            </div>
            <span className="timeline-time">
              {formatMs(start)} – {formatMs(start + duration)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
