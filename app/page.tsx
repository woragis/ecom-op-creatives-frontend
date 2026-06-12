import Link from "next/link";
import { listCreativeRuns, listProducts } from "@/lib/api";

function countByStatus(runs: { status: string }[], status: string) {
  return runs.filter((r) => r.status === status).length;
}

export default async function HomePage() {
  let productCount = 0;
  let runs: { status: string }[] = [];
  let error: string | null = null;

  try {
    const [products, runList] = await Promise.all([
      listProducts(),
      listCreativeRuns(),
    ]);
    productCount = products.length;
    runs = runList;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard";
  }

  const runCount = runs.length;
  const running = countByStatus(runs, "running");
  const needsReview = countByStatus(runs, "needs_review");
  const approved = countByStatus(runs, "approved");

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">UGC creative pipeline — products, runs, and production review</p>

      {error ? <p className="error">{error}</p> : null}

      <div className="card-grid dashboard-grid">
        <div className="card">
          <h2>Products</h2>
          <p className="stat">{productCount}</p>
          <p className="muted">registered</p>
          <Link href="/products" className="button">
            Manage products
          </Link>
        </div>
        <div className="card">
          <h2>Creative runs</h2>
          <p className="stat">{runCount}</p>
          <p className="muted">total pipeline runs</p>
          <Link href="/runs" className="button">
            View runs
          </Link>
        </div>
        <div className="card">
          <h2>Running</h2>
          <p className="stat">{running}</p>
          <p className="muted">in progress</p>
        </div>
        <div className="card">
          <h2>Needs review</h2>
          <p className="stat">{needsReview}</p>
          <p className="muted">awaiting approval</p>
        </div>
        <div className="card">
          <h2>Approved</h2>
          <p className="stat">{approved}</p>
          <p className="muted">ready to ship</p>
        </div>
      </div>
    </div>
  );
}
