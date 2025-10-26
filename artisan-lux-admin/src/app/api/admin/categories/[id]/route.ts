import { NextResponse } from "next/server";
import { z } from "zod";
import { CacheTags, revalidateTags } from "@/lib/cache-tags";
import { revalidateSite, tagsForItem } from "@/lib/revalidate";
import { getCategoryById, updateCategory, deleteCategory } from "@/db/queries/categories";
import { slugify } from "@/lib/slugify";
import { TAXONOMY } from "@/lib/taxonomy";

const CategoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
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
  minPrice: z.number().nonnegative().nullable().optional(),
  maxPrice: z.number().nonnegative().nullable().optional(),
  taxonomyKey: z.string().nullable().optional(),
  // Gallery management
  addGalleryIds: z.array(z.number().int().positive()).optional(),
  removeGalleryIds: z.array(z.number().int().positive()).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: pid } = await ctx.params;
  const id = Number(pid);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const item = await getCategoryById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: pid } = await ctx.params;
  const id = Number(pid);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const before = await getCategoryById(id);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = CategoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;
  const nextSlug = data.slug ? data.slug : data.name ? slugify(data.name) : undefined;

  // If taxonomyKey provided and name not supplied, fall back to canonical name
  let nextName = data.name;
  if (!nextName && data.taxonomyKey) {
    const allNodes = [
      ...TAXONOMY.map(r => ({ key: r.key, name: r.name })),
      ...TAXONOMY.flatMap(r => (r.children ?? []).map(c => ({ key: c.key, name: c.name }))),
    ];
    const tnode = allNodes.find(n => n.key === data.taxonomyKey);
    if (tnode) nextName = tnode.name as any;
  }

  const updated = await updateCategory(id, { ...data, ...(nextName ? { name: nextName } : {}), slug: nextSlug });
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  // Gallery updates
  if ((data.addGalleryIds ?? []).length || (data.removeGalleryIds ?? []).length) {
    const { db } = await import("@/db");
    const { categoryMediaLinks } = await import("@/db/schema");
    if ((data.addGalleryIds ?? []).length) {
      const rows = (data.addGalleryIds as number[]).map((mid, i) => ({ categoryId: id, mediaId: mid, role: "gallery", order: i }));
      await db.insert(categoryMediaLinks as any).values(rows as any);
    }
    if ((data.removeGalleryIds ?? []).length) {
      // Drizzle doesn't provide delete by inArray directly here without import; use SQL
      await (db as any).execute({
        sql: `DELETE FROM category_media_links WHERE category_id = $1 AND media_id = ANY($2)`,
        params: [id, data.removeGalleryIds],
      });
    }
  }

  const tags = Array.from(new Set([
    CacheTags.home,
    CacheTags.categories,
    CacheTags.category(updated.slug),
    CacheTags.product(updated.slug),
    CacheTags.featured,
    CacheTags.searchIndex,
    ...tagsForItem(updated.slug),
    ...(before.slug !== updated.slug ? [CacheTags.category(before.slug), CacheTags.product(before.slug)] : []),
  ]));
  revalidateTags(tags);
  await revalidateSite({
    tags,
    paths: [
      "/",
      "/categories",
      `/category/${updated.slug}`,
      `/product/${updated.slug}`,
      `/products/${updated.slug}`,
      "/products",
    ],
  });
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: pid } = await ctx.params;
  const id = Number(pid);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const before = await getCategoryById(id);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const deleted = await deleteCategory(id);
    if (!deleted) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  } catch (err: any) {
    if (err?.message === "CATEGORY_HAS_ORDERS") {
      return NextResponse.json({ error: "Cannot delete: category is referenced by existing orders" }, { status: 409 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  const tags = Array.from(new Set([
    CacheTags.home,
    CacheTags.categories,
    CacheTags.category(before.slug),
    CacheTags.product(before.slug),
    CacheTags.featured,
    CacheTags.searchIndex,
    ...tagsForItem(before.slug),
  ]));
  revalidateTags(tags);
  await revalidateSite({
    tags,
    paths: [
      "/",
      "/categories",
      `/category/${before.slug}`,
      `/product/${before.slug}`,
      `/products/${before.slug}`,
      "/products",
    ],
  });
  return NextResponse.json({ ok: true });
}
