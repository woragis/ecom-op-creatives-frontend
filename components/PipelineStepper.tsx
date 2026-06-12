import type { PipelineStep } from "@/lib/types";

const STEP_LABELS: Record<string, string> = {
  research: "Research",
  hooks: "Hooks",
  script: "Script",
  director: "Director",
  prompter: "Prompter",
  voice: "Voice",
  image: "Image",
  video: "Video",
  subtitles: "Subs",
  render: "Render",
  postprocess: "Post",
  supervisor: "QA",
};

type Props = {
  steps: PipelineStep[];
};

export function PipelineStepper({ steps }: Props) {
  const sorted = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className="stepper" role="list">
      {sorted.map((step) => (
        <div key={step.id} className="stepper-item" role="listitem">
          <div className={`stepper-dot stepper-dot-${step.status}`} title={step.status} />
          <div className="stepper-label">
            <span className="stepper-name">{STEP_LABELS[step.stepType] ?? step.stepType}</span>
            <span className={`badge badge-${step.status}`}>{step.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
