import Link from "next/link";
import LiveCatalogRefresh from "@/components/site/LiveCatalogRefresh.server";
import ProductGallery from "@/components/site/ProductGallery";
import ProductActions from "@/components/site/ProductActions";

export const revalidate = 300; // 5 minutes ISR, with on-demand revalidation from admin

type AdminItem = {
  id: number;
  name: string;
  slug: string;
  priceDecimal?: number | null;
  currency?: string | null;
  descriptionRich?: string | null;
  materials?: string[] | null;
  tags?: string[] | null;
  coverImage?: { url?: string | null } | null;
  gallery?: { url?: string | null }[];
  videoAsset?: { type?: string | null; url?: string | null } | null;
};

type ProductView = {
  title: string;
  slug: string;
  priceDecimal: number;
  currency: string;
  descriptionRich: string | null;
  materials: string[] | null;
  tags: string[];
  coverImageUrl: string | null;
  gallery: string[];
  videoUrl: string | null;
  status: "published";
};

async function getProduct(slug: string): Promise<ProductView | null> {
  try {
    // Fetch from admin backend directly to bypass any proxy issues
    const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || process.env.ADMIN_BASE_URL || "https://artisan-lux-e-commerce-website.vercel.app";
    const res = await fetch(`${adminOrigin}/api/catalog`, { 
      next: { 
        tags: ["product:" + slug, "catalog"], 
        revalidate: 300 
      } 
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items: AdminItem[] };
    const found = (data.items || []).find((it) => it.slug === slug);
    if (!found) return null;
    const galleryUrls = (found.gallery || []).filter((g) => !!g?.url).map((g) => g.url as string);
    const videoUrl = (found.videoAsset && found.videoAsset.type === "video") ? (found.videoAsset.url ?? null) : null;
    return {
      title: found.name,
      slug: found.slug,
      priceDecimal: Number(found.priceDecimal ?? 0),
      currency: found.currency ?? "USD",
      descriptionRich: found.descriptionRich ?? null,
      materials: found.materials ?? null,
      tags: found.tags ?? [],
      coverImageUrl: found.coverImage?.url ?? null,
      gallery: galleryUrls,
      videoUrl,
      status: "published",
    };
  } catch {
    return null;
  }
}

export default async function ProductPage(props: unknown) {
  const { params } = (props as { params: Promise<{ slug: string }> });
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p || p.status !== "published") {
    return (
      <main className="min-h-screen p-8 text-center">
        <h1 className="text-3xl font-serif">Product not found</h1>
        <p className="mt-4"><Link className="underline" href="/categories">Back to categories</Link></p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">Artisan Lux</Link>
        <div className="flex gap-6 text-sm">
          <Link href="/categories" className="hover:text-[#cd7f32] transition-colors">Categories</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-start">
        {/* Live refresh when catalog changes */}
        <LiveCatalogRefresh />
        <div>
          <ProductGallery title={p.title} cover={p.coverImageUrl} gallery={p.gallery} />
        </div>

        <section>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{p.title}</h1>
          <div className="text-xl text-[#cd7f32] font-semibold mb-8">{Number(p.priceDecimal).toFixed(2)} {p.currency}</div>
          {p.descriptionRich && (
            <article className="prose prose-invert max-w-none text-neutral-300" dangerouslySetInnerHTML={{ __html: p.descriptionRich }} />
          )}

          {p.materials && p.materials.length > 0 && (
            <div className="mt-6 text-sm text-neutral-400">Materials: {p.materials.join(", ")}</div>
          )}

          {p.tags.length > 0 && (
            <div className="mt-3 text-sm text-neutral-400">Tags: {p.tags.join(", ")}</div>
          )}

          {p.videoUrl ? (
            <div className="mt-8">
              <video controls className="w-full rounded border border-white/10 bg-black">
                <source src={p.videoUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}

          <ProductActions productName={p.title} productSlug={p.slug} />
        </section>
      </main>

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux. Crafted with passion and precision.</p>
      </footer>
    </div>
  );
}
