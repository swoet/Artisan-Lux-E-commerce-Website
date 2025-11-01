import Link from "next/link";
import CategoryFilters from "@/components/site/CategoryFilters";
import LiveCatalogRefresh from "@/components/site/LiveCatalogRefresh.server";
import { Picture } from "@/components/site/Picture";
import { TAXONOMY_FALLBACK, type TaxonomyNode as TaxonomyNodeFallback } from "@/lib/taxonomy";
import CartIcon from "@/components/site/CartIcon";
import PendingOrdersIcon from "@/components/site/PendingOrdersIcon";
import CategorySearch from "@/components/site/CategorySearch";

export const revalidate = 300; // 5 minutes ISR, with on-demand revalidation from admin

type CategoryRecord = { id: number; name: string; description: string | null };
type ProductRecord = {
  id: number;
  title: string;
  slug: string;
  priceDecimal: unknown;
  currency: string;
  imageUrl?: string | null;
  descriptionRich?: string | null;
  materials?: string[] | null;
  subtitle?: string | null;
  createdAt?: string | Date | null;
  subcategoryId?: number | null;
  taxonomyKey?: string | null;
};

type TaxonomyNode = { key: string; name: string; children?: { key: string; name: string }[] };
type AdminItem = { id: number; name: string; slug: string; taxonomyKey?: string | null; priceDecimal?: number | null; currency?: string; updatedAt?: string | Date | null; coverImage?: { url: string | null } | null; descriptionRich?: string | null; materials?: string[] | null };

async function fetchCatalog(): Promise<{ taxonomy: TaxonomyNode[]; items: AdminItem[]; categories: unknown[] }> {
  try {
    // Fetch from admin backend directly to bypass any proxy issues
    const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || process.env.ADMIN_BASE_URL || "https://artisan-lux-e-commerce-website.vercel.app";
    const res = await fetch(`${adminOrigin}/api/catalog`, { 
      next: { 
        tags: ["catalog"], 
        revalidate: 300 // Cache for 5 minutes, revalidate on-demand via admin
      } 
    });
    if (!res.ok) return { taxonomy: TAXONOMY_FALLBACK as unknown as TaxonomyNode[], items: [], categories: [] };
    const data = await res.json();
    if (!data?.taxonomy?.length) data.taxonomy = TAXONOMY_FALLBACK as unknown as TaxonomyNodeFallback[];
    return data;
  } catch {
    return { taxonomy: TAXONOMY_FALLBACK as unknown as TaxonomyNode[], items: [], categories: [] };
  }
}

function slugFromKey(key: string) { return key.replace(/_/g, "-"); }
function keyFromSlug(slug: string) { return slug.replace(/-/g, "_"); }

async function getData(slug: string): Promise<{ cat: CategoryRecord | null; items: ProductRecord[]; subcats: { id?: number; slug: string; name: string }[]; friendly?: string }> {
  const { taxonomy, items } = await fetchCatalog();
  const rootKey = keyFromSlug(slug);
  const root = (taxonomy as TaxonomyNode[]).find((t) => t.key === rootKey);
  if (!root) return { cat: null, items: [], subcats: [], friendly: undefined };
  const subcats = (root.children ?? []).map((c) => ({ slug: slugFromKey(c.key), name: c.name }));
  // Items: match root key OR any child keys OR keys that start with root (for deeper nesting)
  const childKeys = (root.children ?? []).map((c) => c.key);
  const allKeys = [rootKey, ...childKeys];
  const filtered = (items as AdminItem[]).filter((it) => {
    const key = it.taxonomyKey ?? "";
    return allKeys.includes(key) || key.startsWith(rootKey + "_");
  });
  const mapped: ProductRecord[] = filtered.map((it) => ({
    id: it.id,
    title: it.name,
    slug: it.slug,
    priceDecimal: it.priceDecimal as number,
    currency: it.currency || "USD",
    imageUrl: it.coverImage?.url ?? null,
    descriptionRich: it.descriptionRich ?? null,
    materials: it.materials ?? null,
    subtitle: null,
    createdAt: it.updatedAt ?? null,
    subcategoryId: null,
    taxonomyKey: it.taxonomyKey ?? null,
  }));
  return { cat: { id: -1, name: root.name, description: null }, items: mapped, subcats };
}

export default async function CategoryPage(props: unknown) {
  const { params, searchParams } = (props as { params: Promise<{ slug: string }>; searchParams?: Promise<{ sub?: string; min?: string; max?: string; sort?: "price-asc" | "price-desc" | "newest" | string }> });
  
  // Await params and searchParams as required by Next.js 15
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { cat, items, subcats } = await getData(resolvedParams.slug);
  if (!cat) {
    return (
      <main className="min-h-screen p-8 text-center">
        <h1 className="text-3xl font-serif">Category not found</h1>
        <p className="mt-4"><Link className="underline" href="/categories">Back to categories</Link></p>
      </main>
    );
  }

  const min = resolvedSearchParams?.min ? Number(resolvedSearchParams.min) : undefined;
  const max = resolvedSearchParams?.max ? Number(resolvedSearchParams.max) : undefined;
  const sort = resolvedSearchParams?.sort as undefined | "price-asc" | "price-desc" | "newest";
  const sub = (resolvedSearchParams?.sub as string | undefined) || undefined;

  // Subcategory nav (works for both DB-backed and fallback categories)
  const MAX_VISIBLE = 10;
  const selectedSlug = sub;
  let visible = subcats.slice(0, MAX_VISIBLE);
  let overflow = subcats.slice(MAX_VISIBLE);
  if (selectedSlug) {
    const idx = overflow.findIndex((s) => s.slug === selectedSlug);
    if (idx !== -1) {
      const [sel] = overflow.splice(idx, 1);
      visible = [sel, ...visible.filter((s) => s.slug !== sel.slug)];
    }
  }
  const subNav = (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Link href={`/category/${resolvedParams.slug}`} className={`px-3 py-1 rounded-full border ${!sub ? "border-[#cd7f32] text-[#cd7f32]" : "border-white/20 text-neutral-300"}`}>All</Link>
      {visible.map((s) => (
        <Link key={s.slug} href={`/category/${resolvedParams.slug}?sub=${encodeURIComponent(s.slug)}`} className={`px-3 py-1 rounded-full border ${sub === s.slug ? "border-[#cd7f32] text-[#cd7f32]" : "border-white/20 text-neutral-300"}`}>{s.name}</Link>
      ))}
      {overflow.length > 0 && (
        <details className="relative">
          <summary className="px-3 py-1 rounded-full border border-white/20 text-neutral-300 cursor-pointer select-none [&::-webkit-details-marker]:hidden">More</summary>
          <div className="absolute z-20 mt-2 max-h-80 overflow-auto min-w-[14rem] rounded-md border border-white/10 bg-black/80 backdrop-blur p-2 shadow-lg">
            {overflow.map((s) => (
              <Link key={s.slug} href={`/category/${resolvedParams.slug}?sub=${encodeURIComponent(s.slug)}`} className={`block px-3 py-2 rounded hover:bg-white/10 ${sub === s.slug ? "text-[#cd7f32]" : "text-neutral-200"}`}>{s.name}</Link>
            ))}
          </div>
        </details>
      )}
    </div>
  );

  let filtered = items;

  // Filter by subcategory if a specific one is selected
  if (sub && subcats.length) {
    const chosen = subcats.find((s) => s.slug === sub);
    if (chosen) {
      const chosenKey = keyFromSlug(chosen.slug);
      filtered = filtered.filter((p) => {
        // Match items that have this specific child taxonomy key
        return p.taxonomyKey === chosenKey;
      });
    }
  }

  // Apply price filters
  filtered = filtered.filter((p) => {
    const price = Number(p.priceDecimal as number);
    if (!Number.isNaN(price)) {
      if (min != null && price < min) return false;
      if (max != null && price > max) return false;
    }
    return true;
  });

  if (sort === "price-asc") filtered = filtered.sort((a, b) => Number(a.priceDecimal as number) - Number(b.priceDecimal as number));
  else if (sort === "price-desc") filtered = filtered.sort((a, b) => Number(b.priceDecimal as number) - Number(a.priceDecimal as number));
  else if (sort === "newest") filtered = filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">Artisan Lux</Link>
        <div className="flex gap-6 items-center text-sm">
          <Link href="/categories" className="hover:text-[#cd7f32] transition-colors">Categories</Link>
          <PendingOrdersIcon />
          <CartIcon />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Live refresh when catalog changes */}
        <LiveCatalogRefresh />
        <header className="mb-6">
          <h1 className="text-5xl md:text-7xl font-serif mb-4">{cat.name}</h1>
          {cat.description && <p className="text-neutral-300 max-w-2xl">{cat.description}</p>}
          {subNav}
          <div className="mt-4">
            <CategorySearch categorySlug={resolvedParams.slug} subcats={subcats} items={items as any} />
          </div>
        </header>

        <CategoryFilters initialMin={min} initialMax={max} initialSort={sort} />

        {filtered.length === 0 ? (
          <div className="text-neutral-400 mt-8">No products available yet. Please check back soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filtered.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="block group p-6 border border-white/10 rounded-lg bg-white/5 hover:border-[#cd7f32]/50 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#cd7f32]" aria-label={`View ${p.title}`}>
                {p.imageUrl ? (
                  <div className="aspect-square w-full mb-4 overflow-hidden rounded-md border border-white/10 bg-white/5">
                    <Picture src={p.imageUrl || null} alt={p.title} sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-square w-full mb-4 rounded-md border border-white/10 bg-white/5" />
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-serif group-hover:text-[#cd7f32] transition-colors">{p.title}</h3>
                  <span className="text-sm text-neutral-300">{Number(p.priceDecimal as number).toFixed(2)} {p.currency}</span>
                </div>
                {p.descriptionRich && (
                  <div className="prose prose-invert max-w-none text-neutral-300 mt-3" dangerouslySetInnerHTML={{ __html: p.descriptionRich }} />
                )}
                {p.materials && p.materials.length > 0 && (
                  <div className="mt-3 text-sm text-neutral-400">Materials: {p.materials.join(", ")}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux. Crafted with passion and precision.</p>
      </footer>
    </div>
  );
}
