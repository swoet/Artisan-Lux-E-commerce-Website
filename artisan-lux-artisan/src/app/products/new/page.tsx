import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import ProductForm from "@/components/products/ProductForm";

export default async function NewProductPage() {
  const artisan = await requireArtisanAuth();

  // Fetch all categories
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
