import Link from "next/link";
import {
  createCreativeRun,
  listCreativeRuns,
  listProducts,
  listImageProviders,
  listVideoProviders,
  startCreativeRun,
} from "@/lib/api";
import type { CreativeRun, Product } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function createRunAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const hook = String(formData.get("hook") ?? "").trim();
  const videoProvider = String(formData.get("videoProvider") ?? "kling");
  const imageProvider = String(formData.get("imageProvider") ?? "flux");
  if (!productId) return;
  await createCreativeRun({
    productId,
    hook: hook || undefined,
    videoProvider,
    imageProvider,
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
  let videoProviders = [
    { id: "kling", configured: true, isDefault: true },
    { id: "runway", configured: false, isDefault: false },
    { id: "luma", configured: false, isDefault: false },
    { id: "veo", configured: false, isDefault: false },
  ];
  let imageProviders = [
    { id: "flux", configured: true, isDefault: true },
    { id: "dalle", configured: false, isDefault: false },
  ];
  let error: string | null = null;

  try {
    [runs, products, videoProviders, imageProviders] = await Promise.all([
      listCreativeRuns(),
      listProducts(),
      listVideoProviders(),
      listImageProviders(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load runs";
  }

  const defaultVideoProvider =
    videoProviders.find((p) => p.isDefault)?.id ?? videoProviders[0]?.id ?? "kling";
  const defaultImageProvider =
    imageProviders.find((p) => p.isDefault)?.id ?? imageProviders[0]?.id ?? "flux";

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
        <select name="imageProvider" defaultValue={defaultImageProvider}>
          {imageProviders.map((p) => (
            <option key={p.id} value={p.id}>
              image: {p.id}
              {p.configured ? "" : " (mock)"}
            </option>
          ))}
        </select>
        <select name="videoProvider" defaultValue={defaultVideoProvider}>
          {videoProviders.map((p) => (
            <option key={p.id} value={p.id}>
              video: {p.id}
              {p.configured ? "" : " (mock)"}
            </option>
          ))}
        </select>
        <button type="submit">Create run</button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Image / Video</th>
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
              <td>
                {run.imageProvider} / {run.videoProvider}
              </td>
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
