import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentProofs, orders, customers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const revalidate = 0;

export async function GET() {
  const rows = await db
    .select({
      id: paymentProofs.id,
      uploadedAt: paymentProofs.uploadedAt,
      url: paymentProofs.url,
      paymentMethod: paymentProofs.paymentMethod,
      orderId: orders.id,
      total: orders.total,
      currency: orders.currency,
      email: customers.email,
    })
    .from(paymentProofs)
    .leftJoin(orders, eq(orders.id, paymentProofs.orderId))
    .leftJoin(customers, eq(customers.id, orders.customerId))
    .orderBy(desc(paymentProofs.uploadedAt))
    .limit(50);

  return NextResponse.json({ proofs: rows });
}
