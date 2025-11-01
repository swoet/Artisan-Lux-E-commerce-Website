import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import ProductForm from "@/components/products/ProductForm";
import { eq } from "drizzle-orm";

// Map taxonomy key (snake_case) to site slug (kebab-case)
function slugFromKey(key: string) { return key.replace(/_/g, "-"); }

async function ensureRootCategoriesFromAdmin() {
  // Discover the admin origin (same as storefront uses)
  const localOrigin = ""; // use local API route which proxies admin
  try {
    const res = await fetch(`/api/catalog/taxonomy`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const taxonomy = (data?.taxonomy ?? []) as { key: string; name: string; children?: unknown[] }[];
    // Only top-level nodes are used for the main category listing and URLs
    for (const node of taxonomy) {
      const slug = slugFromKey(node.key);
      const name = node.name;
      // If this slug does not exist yet, insert it
      const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
      if (!existing[0]) {
        await db.insert(categories).values({ name, slug });
      }
    }
  } catch {
    // Non-fatal: if admin is unreachable, we simply don't sync
  }
}

export default async function NewProductPage() {
  const artisan = await requireArtisanAuth();

  // Ensure local categories mirror admin taxonomy roots (id+slug used for FK)
  await ensureRootCategoriesFromAdmin();

  // Fetch all categories (post-sync)
  const allCategories = await db.select().from(categories);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">
            Create New Product
          </h1>
          <p className="text-sm text-neutral-400">
            Add a new product with provenance passport
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm artisan={artisan} categories={allCategories} />
      </main>
    </div>
  );
}
