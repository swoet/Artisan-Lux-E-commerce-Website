import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { batchSyncProductsToAlgolia, AlgoliaProduct } from "@/lib/algolia";

export async function POST() {
  try {
    // Fetch all published products with relations
    const allProducts = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        descriptionRich: products.descriptionRich,
        priceDecimal: products.priceDecimal,
        currency: products.currency,
        categoryId: products.categoryId,
        materials: products.materials,
        tags: products.tags,
        isFeatured: products.isFeatured,
        status: products.status,
        createdAt: products.createdAt,
        coverImageUrl: mediaAssets.url,
      })
      .from(products)
      .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
      .where(eq(products.status, "published"));

    // Enrich with category names
    const enrichedProducts: AlgoliaProduct[] = [];

    for (const product of allProducts) {
      let categoryName: string | undefined;
      let categorySlug: string | undefined;

      if (product.categoryId) {
        const category = await db
          .select({ name: categories.name, slug: categories.slug })
          .from(categories)
          .where(eq(categories.id, product.categoryId))
          .limit(1);

        if (category.length > 0) {
          categoryName = category[0].name;
          categorySlug = category[0].slug;
        }
      }

      enrichedProducts.push({
        objectID: product.id.toString(),
        id: product.id,
        title: product.title,
        slug: product.slug,
        descriptionRich: product.descriptionRich || undefined,
        priceDecimal: parseFloat(product.priceDecimal),
        currency: product.currency,
        categoryName,
        categorySlug,
        materials: product.materials || undefined,
        tags: product.tags || undefined,
        isFeatured: product.isFeatured,
        coverImageUrl: product.coverImageUrl || undefined,
        status: product.status,
        createdAt: new Date(product.createdAt).getTime(),
      });
    }

    // Sync to Algolia
    const result = await batchSyncProductsToAlgolia(enrichedProducts);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Synced ${enrichedProducts.length} products to Algolia`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Algolia sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync products" },
      { status: 500 }
    );
  }
}
