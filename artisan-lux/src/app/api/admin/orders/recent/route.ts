import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const revalidate = 0;

export async function GET() {
  const latest = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20);
  const orderIds = latest.map((o) => o.id);
  const itemsByOrder: Record<number, { orderId: number; productId: number; quantity: number; unitPrice: string; currency: string; title: string | null; slug: string | null }[]> = {};
  if (orderIds.length) {
    const rows = await db
      .select({
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        currency: orderItems.currency,
        title: products.title,
        slug: products.slug,
      })
      .from(orderItems)
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(inArray(orderItems.orderId, orderIds));
    for (const r of rows) {
      (itemsByOrder[r.orderId] ||= []).push(r);
    }
  }

  const enriched = latest.map((o) => ({
    id: o.id,
    email: o.email,
    total: o.total,
    currency: o.currency,
    status: o.status,
    createdAt: o.createdAt,
    items: itemsByOrder[o.id] || [],
  }));

  return NextResponse.json({ orders: enriched });
}