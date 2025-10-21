import { NextResponse } from "next/server";
import { listCategories } from "@/db/queries/categories";
import { TAXONOMY } from "@/lib/taxonomy";
import { hydrateCoverImages, galleriesForCategories } from "@/lib/media";

export const revalidate = 0; // always fresh for admin-driven updates

export async function GET(req: Request) {
  const url = new URL(req.url);
  const only = url.searchParams.get("only");
  const cats = await listCategories();

  const mediaById: Record<number, any> = await hydrateCoverImages(cats as any[]);

  const sellable = (cats as any[]).filter((c) => c.priceDecimal != null);
  const galleries = await galleriesForCategories(sellable.map((c:any)=>c.id));
  const items = sellable.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      taxonomyKey: c.taxonomyKey ?? null,
      description: c.description ?? null,
      descriptionRich: c.descriptionRich ?? null,
      materials: c.materials ?? [],
      tags: c.tags ?? [],
      priceDecimal: c.priceDecimal == null ? null : Number(c.priceDecimal),
      currency: c.currency ?? "USD",
      isFeatured: !!c.isFeatured,
      coverImageId: c.coverImageId ?? null,
      coverImage: c.coverImageId ? mediaById[c.coverImageId] ?? null : null,
      videoAssetId: c.videoAssetId ?? null,
      gallery: galleries[c.id] ?? [],
      updatedAt: c.updatedAt,
    }));

  const payload = { taxonomy: TAXONOMY, categories: cats, items } as any;
  if (only) payload.items = (items as any[]).filter((i) => String(i.id) === String(only));
  return NextResponse.json(payload);
}
