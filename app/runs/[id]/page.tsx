import Link from "next/link";
import { getCreativeRun } from "@/lib/api";

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

  return (
    <div>
      <Link href="/runs">← Back to runs</Link>
      <h1>Run {run.id.slice(0, 8)}</h1>
      <p className="muted">
        Status: {run.status} · Provider: {run.videoProvider}
      </p>

      <table style={{ marginTop: "1.5rem" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Step</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(run.steps ?? []).map((step) => (
            <tr key={step.id}>
              <td>{step.stepOrder}</td>
              <td>{step.stepType}</td>
              <td>{step.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
