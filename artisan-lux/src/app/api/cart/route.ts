import { NextRequest, NextResponse } from "next/server";
import { addItemByProductSlug, getCartWithItems, updateItemQty, removeItem, computeCartTotal } from "@/db/queries/cart";

const CART_COOKIE = "cart_token";

function getOrCreateCartToken(req: NextRequest) {
  let token = req.cookies.get(CART_COOKIE)?.value;
  if (!token) token = crypto.randomUUID();
  return token;
}

function ensureCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: CART_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: true,
  });
}

export async function GET(req: NextRequest) {
  const token = getOrCreateCartToken(req);
  const { items } = await getCartWithItems(token);
  const totals = computeCartTotal(items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice as unknown as string, currency: i.currency })));
  const res = NextResponse.json({ items, totals });
  ensureCookie(res, token);
  return res;
}

export async function POST(req: NextRequest) {
  const token = getOrCreateCartToken(req);
  const body = await req.json().catch(() => ({}));
  const slug = typeof body.productSlug === "string" ? body.productSlug : "";
  const quantity = Number(body.quantity ?? 1) || 1;
  if (!slug) return NextResponse.json({ error: "productSlug required" }, { status: 400 });
  try {
    const { items } = await addItemByProductSlug(token, slug, quantity);
    const totals = computeCartTotal(items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice as unknown as string, currency: i.currency })));
    const res = NextResponse.json({ items, totals });
    ensureCookie(res, token);
    return res;
  } catch (e) {
    console.error("[Cart POST] Error adding item:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to add item" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = getOrCreateCartToken(req);
  const body = await req.json().catch(() => ({}));
  const productId = Number(body.productId);
  const quantity = Number(body.quantity);
  if (!productId || Number.isNaN(quantity)) return NextResponse.json({ error: "productId and quantity required" }, { status: 400 });
  const { items } = await updateItemQty(token, productId, quantity);
  const totals = computeCartTotal(items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice as unknown as string, currency: i.currency })));
  const res = NextResponse.json({ items, totals });
  ensureCookie(res, token);
  return res;
}

export async function DELETE(req: NextRequest) {
  const token = getOrCreateCartToken(req);
  const body = await req.json().catch(() => ({}));
  const productId = Number(body.productId);
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const { items } = await removeItem(token, productId);
  const totals = computeCartTotal(items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice as unknown as string, currency: i.currency })));
  const res = NextResponse.json({ items, totals });
  ensureCookie(res, token);
  return res;
}