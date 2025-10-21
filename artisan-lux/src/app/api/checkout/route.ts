import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCartWithItems, computeCartTotal, createOrderFromCart } from "@/db/queries/cart";

const CART_COOKIE = "cart_token";
const CUSTOMER_COOKIE = "customer_session";

function getCartToken(req: NextRequest) {
  const token = req.cookies.get(CART_COOKIE)?.value;
  if (!token) throw new Error("No cart");
  return token;
}

function parseCustomerEmail(req: NextRequest) {
  const raw = req.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const email = decoded.split(":")[0];
    if (email && /@/.test(email)) return email;
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  const siteOrigin = process.env.SITE_ORIGIN || "http://localhost:3000";
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 });
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });

  let token: string;
  try {
    token = getCartToken(req);
  } catch {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  const { items } = await getCartWithItems(token);
  if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const providedEmail = typeof body.email === "string" ? body.email : null;
  const email = providedEmail || parseCustomerEmail(req);
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const line_items = items.map((it) => ({
    quantity: it.quantity,
    price_data: {
      currency: it.currency.toLowerCase(),
      product_data: { name: (it.title || "Item") as string },
      unit_amount: Math.round(parseFloat(it.unitPrice) * 100),
    },
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items,
    success_url: `${siteOrigin}/?payment=success`,
    cancel_url: `${siteOrigin}/?payment=cancelled`,
    metadata: {
      cart_token: token,
    },
  });

  // Persist pending order linked to the Stripe session id
  await createOrderFromCart(token, email, session.id);

  return NextResponse.json({ url: session.url });
}