import Link from "next/link";

type CategoryCard = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

function seedFromSlug(slug: string) {
  return Array.from(slug).reduce((a, c) => (a * 33 + c.charCodeAt(0)) % 997, 7);
}

function webImageFor(name: string, slug: string, q?: string) {
  const query = encodeURIComponent(q || `${name}, luxury`);
  const seed = seedFromSlug(slug);
  // Primary provider (stable per slug)
  return `https://loremflickr.com/960/640/${query}?lock=${seed}`;
}

async function localImageFor(slug: string): Promise<string | null> {
  // Prefer modern formats, but check what actually exists on disk
  const exts = ["webp", "jpg", "jpeg", "png", "avif"] as const;
  try {
    const { access } = await import("fs/promises");
    const { join } = await import("path");
    for (const ext of exts) {
      const abs = join(process.cwd(), "public", "categories", `${slug}.${ext}`);
      try {
        await access(abs);
        return `/categories/${slug}.${ext}`;
      } catch {
        // continue checking next ext
      }
    }
  } catch {
    // fs not available (shouldn't happen on server components)
  }
  return null;
}

function slugFromKey(key: string) {
  return key.replace(/_/g, "-");
}

async function fetchTaxonomy(): Promise<{ key: string; name: string; children?: { key: string; name: string }[] }[]> {
  const origin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || process.env.ADMIN_ORIGIN || "";
  if (!origin) return [];
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${origin}/api/catalog/taxonomy`, { cache: "no-store", signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return [];
    const j = await res.json().catch(() => ({ taxonomy: [] }));
    return j.taxonomy ?? [];
  } catch {
    // Swallow network errors and fall back to promo items
    return [];
  }
}

function promoItems(limit: number): CategoryCard[] {
  // Fallback curated list in case admin API is unavailable
  const base: { name: string; slug: string; q?: string }[] = [
    { name: "Electronics", slug: "electronics", q: "electronics gadgets premium" },
    { name: "Fashion", slug: "fashion", q: "luxury fashion apparel" },
    { name: "Home & Living", slug: "home-living", q: "modern home decor" },
    { name: "Art & Collectibles", slug: "art-collectibles", q: "art collectibles" },
    { name: "Beauty & Grooming", slug: "beauty-grooming", q: "beauty cosmetics luxury" },
    { name: "Outdoor & Garden", slug: "outdoor-garden", q: "outdoor garden decor" },
    { name: "Toys & Games", slug: "toys-games", q: "toys games" },
  ];
  return base.slice(0, limit).map(({ name, slug, q }) => ({
    name,
    slug,
    description: null,
    imageUrl: webImageFor(name, slug, q),
  }));
}

import { Picture as ResponsivePicture } from "@/components/site/Picture";

function CategoryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ResponsivePicture
      src={src}
      alt={alt}
      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

export default async function CategoryGrid({ limit }: { limit?: number }) {
  // Homepage categories are driven strictly by taxonomy roots, not DB rows.
  const taxonomy = await fetchTaxonomy();
  const roots = taxonomy.slice(0, limit ?? taxonomy.length).map((r) => ({
    name: r.name,
    slug: slugFromKey(r.key),
    description: null,
    imageUrl: webImageFor(r.name, slugFromKey(r.key)),
  }));

  const baseCards: CategoryCard[] = (roots.length ? roots : promoItems(limit ?? 24));
  const cards = await Promise.all(
    baseCards.map(async (c) => ({
      ...c,
      imageUrl: (await localImageFor(c.slug)) || c.imageUrl,
    }))
  );

  return (
    <section aria-labelledby="home-categories" className="mt-24">
      <div className="flex items-end justify-between mb-6">
        <h2 id="home-categories" className="text-3xl md:text-4xl font-serif">
          Shop by <span className="bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">Category</span>
        </h2>
        <Link href="/categories" className="text-sm text-[#cd7f32] hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const src = c.imageUrl || webImageFor(c.name, c.slug);
          const href = `/category/${c.slug}`;
          return (
            <Link
              key={c.slug}
              href={href}
              className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-[#cd7f32]/50 transition-all hover:scale-[1.01]"
            >
              <div className="relative aspect-[4/3]">
                <CategoryImage src={src} alt={c.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-serif tracking-wide">{c.name}</h3>
                  {c.description && (
                    <p className="mt-1 text-sm text-neutral-300 line-clamp-2">{c.description}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
