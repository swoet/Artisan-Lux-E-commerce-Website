import { NextRequest, NextResponse } from "next/server";
import { getCartWithItems, createOrderFromCart } from "@/db/queries/cart";

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

  // Create order reference
  const orderRef = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create pending order
  const order = await createOrderFromCart(token, email, orderRef);

  // Return order ID for payment instructions page
  return NextResponse.json({ 
    orderId: order.id,
    orderRef 
  });
}
