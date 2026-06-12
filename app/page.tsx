import Link from "next/link";
import { listCreativeRuns, listProducts } from "@/lib/api";

export default async function HomePage() {
  let productCount = 0;
  let runCount = 0;
  let error: string | null = null;

  try {
    const [products, runs] = await Promise.all([
      listProducts(),
      listCreativeRuns(),
    ]);
    productCount = products.length;
    runCount = runs.length;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard";
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Phase 3 — image, image2video, and asset uploads</p>

      {error ? <p className="error">{error}</p> : null}

      <div className="card-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h2>Products</h2>
          <p>{productCount} registered</p>
          <Link href="/products" className="button">
            Manage products
          </Link>
        </div>
        <div className="card">
          <h2>Creative runs</h2>
          <p>{runCount} pipeline runs</p>
          <Link href="/runs" className="button">
            View runs
          </Link>
        </div>
      </div>
    </div>
  );
}
