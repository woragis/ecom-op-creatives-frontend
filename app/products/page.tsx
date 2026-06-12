import { createProduct, listProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function createProductAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const niche = String(formData.get("niche") ?? "").trim();
  if (!name) return;
  await createProduct({
    name,
    url: url || undefined,
    niche: niche || undefined,
  });
  revalidatePath("/products");
  revalidatePath("/");
}

export default async function ProductsPage() {
  let items: Product[] = [];
  let error: string | null = null;

  try {
    items = await listProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <div>
      <h1>Products</h1>

      <form action={createProductAction} className="form">
        <input name="name" placeholder="Product name" required />
        <input name="url" placeholder="Product URL (optional)" />
        <input name="niche" placeholder="Niche (optional)" />
        <button type="submit">Add product</button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <div className="card-grid">
        {items.map((product) => (
          <div key={product.id} className="card">
            <h2>{product.name}</h2>
            {product.niche ? <p className="muted">{product.niche}</p> : null}
            {product.url ? (
              <a href={product.url} target="_blank" rel="noreferrer">
                {product.url}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
