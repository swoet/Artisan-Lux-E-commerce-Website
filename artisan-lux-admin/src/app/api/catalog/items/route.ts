import { NextResponse } from "next/server";
import { listCategories } from "@/db/queries/categories";
import { hydrateCoverImages } from "@/lib/media";

export const revalidate = 0;

export async function GET() {
  const cats = await listCategories();
  const sellable = (cats as any[]).filter((c) => c.priceDecimal != null);

  // Resolve cover images to URLs so the frontend can render immediately
  const mediaMap = await hydrateCoverImages(sellable);

  const items = sellable.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      taxonomyKey: c.taxonomyKey ?? null,
      taxonomyKeySlug: c.taxonomyKey ? String(c.taxonomyKey).replaceAll("_","-") : null,
      description: c.description ?? null,
      descriptionRich: c.descriptionRich ?? null,
      priceDecimal: c.priceDecimal == null ? null : Number(c.priceDecimal),
      currency: c.currency ?? "USD",
      isFeatured: !!c.isFeatured,
      coverImageId: c.coverImageId ?? null,
      coverImageUrl: c.coverImageId ? mediaMap[c.coverImageId]?.url ?? null : null,
      videoAssetId: c.videoAssetId ?? null,
      updatedAt: c.updatedAt,
    }));
  return NextResponse.json({ items });
}
