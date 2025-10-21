import { db } from "@/db";
import { products } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type ProductInput = {
  title: string;
  slug: string;
  subtitle?: string | null;
  descriptionRich?: string | null;
  priceDecimal: string; // keep as string, db numeric
  currency?: string;
  categoryId?: number | null;
  tags?: string[] | null;
  status?: "draft" | "published";
  isFeatured?: boolean;
  order?: number;
};

export async function listProducts() {
  return db.select().from(products).orderBy(asc(products.order), asc(products.title));
}

export async function getProductBySlug(slug: string) {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createProduct(input: ProductInput) {
  const exists = await getProductBySlug(input.slug);
  if (exists) throw new Error("Slug already exists");
  const rows = await db
    .insert(products)
    .values({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle ?? null,
      descriptionRich: input.descriptionRich ?? null,
      // drizzle numeric type: pass through as string to driver
      priceDecimal: input.priceDecimal as unknown as string as unknown as never,
      currency: input.currency ?? "USD",
      categoryId: input.categoryId ?? null,
      tags: input.tags ?? null,
      status: input.status ?? "draft",
      isFeatured: input.isFeatured ?? false,
      order: input.order ?? 0,
    })
    .returning();
  return rows[0];
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const rows = await db
    .update(products)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
      ...(input.descriptionRich !== undefined ? { descriptionRich: input.descriptionRich } : {}),
      ...(input.priceDecimal !== undefined ? { priceDecimal: input.priceDecimal as unknown as string as unknown as never } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
    })
    .where(eq(products.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteProduct(id: number) {
  const rows = await db.delete(products).where(eq(products.id, id)).returning();
  return rows[0] ?? null;
}
