import Link from "next/link";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import CategoryGrid from "@/components/site/CategoryGrid";

// Disable static optimization
export const revalidate = 0;

export const metadata = {
  title: "Categories - Artisan Lux",
  description: "Explore our curated categories of luxury artisan goods",
};

async function getPublishedCategories() {
  return await db
    .select()
    .from(categories)
    .where(eq(categories.status, "published"))
    .orderBy(asc(categories.order), asc(categories.name));
}

export default async function CategoriesPage() {
  const items = await getPublishedCategories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          Artisan Lux
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/categories" className="text-[#cd7f32]">Categories</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-5xl md:text-7xl font-serif mb-6">
          Our <span className="bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">Categories</span>
        </h1>
        <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
          Discover exceptional craftsmanship across our curated collections.
        </p>

        {/* Always show the category grid; it falls back to curated set when DB is empty */}
        <CategoryGrid />
      </main>

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux. Crafted with passion and precision.</p>
      </footer>
    </div>
  );
}
