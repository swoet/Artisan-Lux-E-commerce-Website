import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { carts, orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clearCart } from "@/db/queries/cart";

export const runtime = "nodejs"; // ensure Node runtime for webhooks

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;
    const email = session.customer_email || "";
    const currency = session.currency?.toUpperCase() || "USD";
    const amountTotal = (session.amount_total || 0) / 100;
    const cartToken = (session.metadata && session.metadata["cart_token"]) || null;

    // Mark payment succeeded
    await db
      .update(payments)
      .set({ status: "succeeded" })
      .where(eq(payments.providerSessionId, sessionId));

    // Mark order paid
    await db
      .update(orders)
      .set({ status: "paid" })
      .where(eq(orders.email, email));

    if (cartToken) {
      // Find cart and clear
      const cartRow = (await db.select().from(carts).where(eq(carts.sessionToken, cartToken)).limit(1))[0];
      if (cartRow) {
        await clearCart(cartRow.id);
        await db.update(carts).set({ status: "converted" }).where(eq(carts.id, cartRow.id));
      }
    }
  }

  return NextResponse.json({ received: true });
}