import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryHistory, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");

    const baseQuery = db
      .select({
        id: inventoryHistory.id,
        productId: inventoryHistory.productId,
        productTitle: products.title,
        quantityChange: inventoryHistory.quantityChange,
        reason: inventoryHistory.reason,
        notes: inventoryHistory.notes,
        createdAt: inventoryHistory.createdAt,
      })
      .from(inventoryHistory)
      .innerJoin(products, eq(inventoryHistory.productId, products.id));

    const history = productId
      ? await baseQuery
          .where(eq(inventoryHistory.productId, Number(productId)))
          .orderBy(desc(inventoryHistory.createdAt))
          .limit(100)
      : await baseQuery
          .orderBy(desc(inventoryHistory.createdAt))
          .limit(100);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Get inventory history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
