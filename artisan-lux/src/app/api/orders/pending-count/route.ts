import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { orders, customers, paymentProofs } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("customer_email")?.value;

    if (!email) {
      return NextResponse.json({ count: 0 });
    }

    // Get customer
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ count: 0 });
    }

    // Get all pending orders for this customer
    const pendingOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.customerId, customer.id));

    const pendingIds = pendingOrders
      .filter((o) => o.id)
      .map((o) => o.id);

    if (pendingIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    // Get orders that have proofs
    const proofsMap = new Map<number, boolean>();
    const proofs = await db
      .select({ orderId: paymentProofs.orderId })
      .from(paymentProofs)
      .where(inArray(paymentProofs.orderId, pendingIds));

    proofs.forEach((p) => proofsMap.set(p.orderId, true));

    // Count orders without proofs
    const count = pendingIds.filter((id) => !proofsMap.has(id)).length;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Pending count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
