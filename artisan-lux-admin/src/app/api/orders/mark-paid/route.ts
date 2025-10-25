import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders /*, payments */ } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = Number(body.orderId);
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
    // Optionally mark payments as succeeded too:
    // await db.update(payments).set({ status: "succeeded" }).where(eq(payments.orderId, orderId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark paid error:", error);
    return NextResponse.json({ error: "Failed to mark as paid" }, { status: 500 });
  }
}
