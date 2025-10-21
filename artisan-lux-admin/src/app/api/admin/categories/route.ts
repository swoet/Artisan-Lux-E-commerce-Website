import { NextResponse } from "next/server";
import { z } from "zod";
import { CacheTags, revalidateTags } from "@/lib/cache-tags";
import { revalidateSite, tagsForItem } from "@/lib/revalidate";
import { listCategories, createCategory } from "@/db/queries/categories";
import { slugify } from "@/lib/slugify";
import { TAXONOMY } from "@/lib/taxonomy";

export async function GET() {
  const items = await listCategories();
  return NextResponse.json({ items });
}

const CategorySchema = z.object({
  taxonomyKey: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  descriptionRich: z.string().nullable().optional(),
  parentCategoryId: z.number().int().nullable().optional(),
  order: z.number().int().optional(),
  status: z.enum(["draft", "published"]).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  // Product-like fields
  priceDecimal: z.number().nonnegative().nullable().optional(),
  currency: z.string().min(3).max(3).optional(),
  coverImageId: z.number().int().positive().nullable().optional(),
  videoAssetId: z.number().int().positive().nullable().optional(),
  model3dAssetId: z.number().int().positive().nullable().optional(),
  isFeatured: z.boolean().optional(),
  materials: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  // Price range fields
  minPrice: z.number().nonnegative().nullable().optional(),
  maxPrice: z.number().nonnegative().nullable().optional(),
  // Gallery
  galleryIds: z.array(z.number().int().positive()).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug && data.slug.trim().length > 0 ? data.slug : slugify(data.name);
  try {
    // Keep provided name; fall back to canonical taxonomy name only if name is empty
    const allNodes = [
      ...TAXONOMY.map(r => ({ key: r.key, name: r.name })),
      ...TAXONOMY.flatMap(r => (r.children ?? []).map(c => ({ key: c.key, name: c.name }))),
    ];
    const tnode = allNodes.find(n => n.key === data.taxonomyKey);
    const finalName = (data.name && data.name.trim().length > 0) ? data.name : (tnode?.name ?? data.name);
    const item = await createCategory({
      name: finalName,
      slug,
      description: data.description ?? null,
      descriptionRich: data.descriptionRich ?? null,
      parentCategoryId: data.parentCategoryId ?? null,
      order: data.order,
      status: data.status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      // Product-like fields
      priceDecimal: data.priceDecimal ?? null,
      currency: data.currency ?? "USD",
      coverImageId: data.coverImageId ?? null,
      videoAssetId: data.videoAssetId ?? null,
      model3dAssetId: data.model3dAssetId ?? null,
      isFeatured: data.isFeatured ?? false,
      materials: data.materials ?? undefined,
      tags: data.tags ?? undefined,
      // Price range fields
      minPrice: data.minPrice ?? null,
      maxPrice: data.maxPrice ?? null,
      taxonomyKey: data.taxonomyKey,
    });
    
    // Attach gallery media if provided
    if ((data.galleryIds ?? []).length) {
      const { db } = await import("@/db");
      const { categoryMediaLinks } = await import("@/db/schema");
      // Insert one row at a time to avoid driver placeholder issues on some setups
      for (const [i, mid] of (data.galleryIds as number[]).entries()) {
        await db.insert(categoryMediaLinks as any).values({
          categoryId: (item as any).id,
          mediaId: mid,
          role: "gallery",
          order: i,
        } as any);
      }
    }
    const tags = Array.from(new Set([
      CacheTags.home,
      CacheTags.categories,
      CacheTags.category(item.slug),
      CacheTags.product(item.slug),
      CacheTags.featured,
      CacheTags.searchIndex,
      ...tagsForItem(item.slug),
    ]));
    revalidateTags(tags);
    await revalidateSite({
      tags,
      paths: [
        "/",
        "/categories",
        `/category/${item.slug}`,
        `/product/${item.slug}`,
        `/products/${item.slug}`,
        "/products",
      ],
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
