import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, inventoryHistory, products } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

// Get inventory for all products or specific product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");

    if (productId) {
      // Get specific product inventory
      const result = await db
        .select({
          id: inventory.id,
          productId: inventory.productId,
          productTitle: products.title,
          quantityInStock: inventory.quantityInStock,
          lowStockThreshold: inventory.lowStockThreshold,
          lastRestockedAt: inventory.lastRestockedAt,
          updatedAt: inventory.updatedAt,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .where(eq(inventory.productId, Number(productId)))
        .limit(1);

      return NextResponse.json({ inventory: result[0] || null });
    } else {
      // Get all inventory with low stock alerts
      const allInventory = await db
        .select({
          id: inventory.id,
          productId: inventory.productId,
          productTitle: products.title,
          productSlug: products.slug,
          quantityInStock: inventory.quantityInStock,
          lowStockThreshold: inventory.lowStockThreshold,
          isLowStock: lt(inventory.quantityInStock, inventory.lowStockThreshold),
          lastRestockedAt: inventory.lastRestockedAt,
          updatedAt: inventory.updatedAt,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id));

      return NextResponse.json({ inventory: allInventory });
    }
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// Update inventory (restock or adjust)
export async function POST(request: NextRequest) {
  try {
    const { productId, quantityChange, reason, notes } = await request.json();

    if (!productId || quantityChange === undefined) {
      return NextResponse.json(
        { error: "Product ID and quantity change required" },
        { status: 400 }
      );
    }

    // Get current inventory
    const current = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, productId))
      .limit(1);

    let newQuantity: number;

    if (current.length === 0) {
      // Create new inventory record
      await db.insert(inventory).values({
        productId,
        quantityInStock: quantityChange,
        lowStockThreshold: 5,
        lastRestockedAt: quantityChange > 0 ? new Date() : null,
      });
      newQuantity = quantityChange;
    } else {
      // Update existing inventory
      newQuantity = current[0].quantityInStock + quantityChange;
      
      await db
        .update(inventory)
        .set({
          quantityInStock: newQuantity,
          lastRestockedAt: quantityChange > 0 ? new Date() : current[0].lastRestockedAt,
          updatedAt: new Date(),
        })
        .where(eq(inventory.productId, productId));
    }

    // Log the change in history
    await db.insert(inventoryHistory).values({
      productId,
      quantityChange,
      reason: reason || (quantityChange > 0 ? "restock" : "adjustment"),
      notes,
    });

    return NextResponse.json({
      success: true,
      newQuantity,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

// Update low stock threshold
export async function PATCH(request: NextRequest) {
  try {
    const { productId, lowStockThreshold } = await request.json();

    if (!productId || lowStockThreshold === undefined) {
      return NextResponse.json(
        { error: "Product ID and threshold required" },
        { status: 400 }
      );
    }

    await db
      .update(inventory)
      .set({ lowStockThreshold, updatedAt: new Date() })
      .where(eq(inventory.productId, productId));

    return NextResponse.json({
      success: true,
      message: "Threshold updated successfully",
    });
  } catch (error) {
    console.error("Update threshold error:", error);
    return NextResponse.json(
      { error: "Failed to update threshold" },
      { status: 500 }
    );
  }
}
