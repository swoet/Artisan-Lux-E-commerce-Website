import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, mediaAssets } from "@/db/schema";
import { eq, and, gte, lte, inArray, desc, asc, sql } from "drizzle-orm";

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const materials = searchParams.get("materials")?.split(",").filter(Boolean);
    const categories = searchParams.get("categories")?.split(",").filter(Boolean);
    const featured = searchParams.get("featured") === "true";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build query conditions
    type Condition = ReturnType<typeof eq>;
    const conditions: Condition[] = [eq(products.status, "published")];

    if (minPrice) {
      conditions.push(gte(products.priceDecimal, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(products.priceDecimal, maxPrice));
    }
    if (featured) {
      conditions.push(eq(products.isFeatured, true));
    }
    if (materials && materials.length > 0) {
      // Filter by materials (array contains any)
      conditions.push(sql`${products.materials} && ${materials}`);
    }

    // Base query with sorting
    const query = db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        priceDecimal: products.priceDecimal,
        currency: products.currency,
        isFeatured: products.isFeatured,
        materials: products.materials,
        coverImageUrl: mediaAssets.url,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
      .where(and(...conditions));

    // Apply sorting
    let results;
    switch (sortBy) {
      case "price_asc":
        results = await query.orderBy(asc(products.priceDecimal));
        break;
      case "price_desc":
        results = await query.orderBy(desc(products.priceDecimal));
        break;
      case "name":
        results = await query.orderBy(asc(products.title));
        break;
      case "newest":
      default:
        results = await query.orderBy(desc(products.createdAt));
        break;
    }

    return NextResponse.json({ products: results });
  } catch (error) {
    console.error("Filter error:", error);
    return NextResponse.json(
      { error: "Failed to filter products" },
      { status: 500 }
    );
  }
}
