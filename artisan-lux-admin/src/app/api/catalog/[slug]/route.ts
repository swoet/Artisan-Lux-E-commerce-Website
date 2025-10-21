import { NextResponse } from "next/server";
import { getCategoryBySlug } from "@/db/queries/categories";
import { hydrateCoverImages, galleryForCategory } from "@/lib/media";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 0;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const c = await getCategoryBySlug(slug);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mediaById: Record<number, any> = await hydrateCoverImages([c] as any[]);
  const gallery = await galleryForCategory((c as any).id);

  let videoAsset: any = null;
  if ((c as any).videoAssetId) {
    const rows = await db.select().from(mediaAssets).where(eq(mediaAssets.id, (c as any).videoAssetId)).limit(1);
    videoAsset = rows[0] ?? null;
  }

  const item = {
    id: (c as any).id,
    name: (c as any).name,
    slug: (c as any).slug,
    taxonomyKey: (c as any).taxonomyKey ?? null,
    description: (c as any).description ?? null,
    descriptionRich: (c as any).descriptionRich ?? null,
    materials: (c as any).materials ?? [],
    tags: (c as any).tags ?? [],
    priceDecimal: (c as any).priceDecimal == null ? null : Number((c as any).priceDecimal),
    currency: (c as any).currency ?? "USD",
    isFeatured: !!(c as any).isFeatured,
    coverImageId: (c as any).coverImageId ?? null,
    coverImage: (c as any).coverImageId ? mediaById[(c as any).coverImageId] ?? null : null,
    videoAssetId: (c as any).videoAssetId ?? null,
    videoAsset,
    gallery,
    updatedAt: (c as any).updatedAt,
  };

  return NextResponse.json({ item });
}
