import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  parentCategoryId?: number | null;
  order?: number;
  status?: "draft" | "published";
  seoTitle?: string | null;
  seoDescription?: string | null;
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
    parentCategoryId: input.parentCategoryId ?? null,
    order: input.order ?? 0,
    status: input.status ?? "draft",
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
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
      ...(input.parentCategoryId !== undefined ? { parentCategoryId: input.parentCategoryId } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
    })
    .where(eq(categories.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCategory(id: number) {
  const rows = await db.delete(categories).where(eq(categories.id, id)).returning();
  return rows[0] ?? null;
}
