import { db } from "@/db";
import { categories, categoryMediaLinks, cartItems, wishlistItems, orderItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export type CategoryInput = {
  taxonomyKey?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  descriptionRich?: string | null;
  parentCategoryId?: number | null;
  order?: number;
  status?: "draft" | "published";
  seoTitle?: string | null;
  seoDescription?: string | null;
  // Product-like fields
  priceDecimal?: number | null;
  currency?: string;
  coverImageId?: number | null;
  videoAssetId?: number | null;
  model3dAssetId?: number | null;
  isFeatured?: boolean;
  materials?: string[] | null;
  tags?: string[] | null;
  // Price range fields (for parent categories)
  minPrice?: number | null;
  maxPrice?: number | null;
};

export async function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.order), asc(categories.name));
}

export async function getCategoryById(id: number) {
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createCategory(input: CategoryInput) {
  const exists = await getCategoryBySlug(input.slug);
  if (exists) throw new Error("Slug already exists");
  const rows = await db.insert(categories).values({
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    descriptionRich: input.descriptionRich ?? null,
    parentCategoryId: input.parentCategoryId ?? null,
    order: input.order ?? 0,
    status: input.status ?? "draft",
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    // Product-like fields
    priceDecimal: input.priceDecimal == null ? null : String(input.priceDecimal),
    currency: input.currency ?? "USD",
    coverImageId: input.coverImageId ?? null,
    videoAssetId: input.videoAssetId ?? null,
    model3dAssetId: input.model3dAssetId ?? null,
    isFeatured: input.isFeatured ?? false,
    materials: input.materials ?? undefined,
    tags: input.tags ?? undefined,
    // Price range fields
    minPrice: input.minPrice == null ? null : String(input.minPrice),
    maxPrice: input.maxPrice == null ? null : String(input.maxPrice),
    taxonomyKey: input.taxonomyKey ?? null,
  }).returning();
  return rows[0];
}

export async function updateCategory(id: number, input: Partial<CategoryInput>) {
  // If slug is changing, ensure uniqueness
  if (input.slug) {
    const existing = await getCategoryBySlug(input.slug);
    if (existing && existing.id !== id) throw new Error("Slug already exists");
  }
  const rows = await db.update(categories)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.descriptionRich !== undefined ? { descriptionRich: input.descriptionRich } : {}),
      ...(input.parentCategoryId !== undefined ? { parentCategoryId: input.parentCategoryId } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      // Product-like fields
      ...(input.priceDecimal !== undefined ? { priceDecimal: input.priceDecimal == null ? null : String(input.priceDecimal) } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.coverImageId !== undefined ? { coverImageId: input.coverImageId } : {}),
      ...(input.videoAssetId !== undefined ? { videoAssetId: input.videoAssetId } : {}),
      ...(input.model3dAssetId !== undefined ? { model3dAssetId: input.model3dAssetId } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.materials !== undefined ? { materials: input.materials } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      // Price range fields
      ...(input.minPrice !== undefined ? { minPrice: input.minPrice == null ? null : String(input.minPrice) } : {}),
      ...(input.maxPrice !== undefined ? { maxPrice: input.maxPrice == null ? null : String(input.maxPrice) } : {}),
      ...(input.taxonomyKey !== undefined ? { taxonomyKey: input.taxonomyKey } : {}),
    })
    .where(eq(categories.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCategory(id: number) {
  // Clean up all references to satisfy FKs (admin has full control to delete)
  await db.delete(orderItems).where(eq(orderItems.productId, id));
  await db.delete(cartItems).where(eq(cartItems.productId, id));
  await db.delete(wishlistItems).where(eq(wishlistItems.productId, id));
  await db.delete(categoryMediaLinks).where(eq(categoryMediaLinks.categoryId, id));

  const rows = await db.delete(categories).where(eq(categories.id, id)).returning();
  return rows[0] ?? null;
}
