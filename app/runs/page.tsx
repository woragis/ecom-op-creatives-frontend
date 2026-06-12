import Link from "next/link";
import {
  createCreativeRun,
  listCreativeRuns,
  listProducts,
  startCreativeRun,
} from "@/lib/api";
import type { CreativeRun, Product } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function createRunAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const hook = String(formData.get("hook") ?? "").trim();
  const videoProvider = String(formData.get("videoProvider") ?? "kling");
  if (!productId) return;
  await createCreativeRun({
    productId,
    hook: hook || undefined,
    videoProvider,
  });
  revalidatePath("/runs");
  revalidatePath("/");
}

async function startRunAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await startCreativeRun(id);
  revalidatePath("/runs");
  revalidatePath(`/runs/${id}`);
}

function statusClass(status: string) {
  return `badge badge-${status}`;
}

export default async function RunsPage() {
  let runs: CreativeRun[] = [];
  let products: Product[] = [];
  let error: string | null = null;

  try {
    [runs, products] = await Promise.all([listCreativeRuns(), listProducts()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load runs";
  }

  return (
    <div>
      <h1>Creative runs</h1>

      <form action={createRunAction} className="form">
        <select name="productId" required defaultValue="">
          <option value="" disabled>
            Select product
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input name="hook" placeholder="Hook (optional)" />
        <select name="videoProvider" defaultValue="kling">
          <option value="kling">Kling</option>
          <option value="runway">Runway</option>
          <option value="luma">Luma</option>
          <option value="veo">Veo</option>
        </select>
        <button type="submit">Create run</button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Provider</th>
            <th>Hook</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td>
                <span className={statusClass(run.status)}>{run.status}</span>
              </td>
              <td>{run.videoProvider}</td>
              <td>{run.hook ?? "—"}</td>
              <td>{new Date(run.createdAt).toLocaleString()}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/runs/${run.id}`}>View</Link>
                {run.status === "draft" || run.status === "failed" ? (
                  <form action={startRunAction}>
                    <input type="hidden" name="id" value={run.id} />
                    <button type="submit">Start</button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
