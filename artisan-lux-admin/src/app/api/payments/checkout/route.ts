import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createOrder, recordPayment } from "@/db/queries/orders";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: "items required" }, { status: 400 });
  try {
    const stripe = getStripe();
    const currency = (body.currency as string) || "USD";
    const total = items.reduce((acc:number, it:any)=> acc + (it.unit_amount || 0) * (it.quantity || 1), 0) / 100;
    const order = await createOrder({ total, currency });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000"}/success?order=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000"}/cart`,
      line_items: items.map((it:any)=> ({ price_data: { currency, product_data: { name: it.name }, unit_amount: it.unit_amount }, quantity: it.quantity || 1 })),
      metadata: { orderId: String(order.id) },
    });
    await recordPayment({ orderId: order.id, provider: "stripe", amount: total, currency, providerSessionId: session.id, status: "created" });
    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "failed" }, { status: 500 });
  }
}
