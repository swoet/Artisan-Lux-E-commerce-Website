import { db } from "@/db";
import { carts, cartItems, products, orders, orderItems, payments } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export type CartItemView = {
  productId: number;
  slug: string;
  title: string;
  quantity: number;
  unitPrice: string; // stored as string for numeric
  currency: string;
};

const asNumeric = (n: string | number) => String(n);

export async function getOrCreateCartByToken(sessionToken: string, email?: string | null) {
  const existing = await db.select().from(carts).where(eq(carts.sessionToken, sessionToken)).limit(1);
  if (existing[0]) {
    // attach email if provided and not set
    if (email && !existing[0].email) {
      await db.update(carts).set({ email }).where(eq(carts.id, existing[0].id));
    }
    return existing[0];
  }
  const rows = await db
    .insert(carts)
    .values({ sessionToken, email: email ?? null })
    .returning();
  return rows[0];
}

export async function getCartWithItems(sessionToken: string) {
  const cart = await getOrCreateCartByToken(sessionToken);
  const items = await db
    .select({
      productId: cartItems.productId,
      slug: products.slug,
      title: products.title,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      currency: cartItems.currency,
    })
    .from(cartItems)
    .leftJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, cart.id))
    .orderBy(asc(products.title));

  return { cart, items } as const;
}

export async function addItemByProductSlug(sessionToken: string, slug: string, quantity: number = 1) {
  const { cart } = await getCartWithItems(sessionToken);
  const product = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  if (!product) throw new Error("Product not found");

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, product.id)))
    .limit(1);

  if (existing[0]) {
    const qty = Math.max(1, existing[0].quantity + quantity);
    await db
      .update(cartItems)
      .set({ quantity: qty })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, product.id)));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId: product.id,
      quantity: Math.max(1, quantity),
      unitPrice: asNumeric(product.priceDecimal as unknown as string),
      currency: product.currency,
    });
  }

  return getCartWithItems(sessionToken);
}

export async function updateItemQty(sessionToken: string, productId: number, quantity: number) {
  const { cart } = await getCartWithItems(sessionToken);
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  }
  return getCartWithItems(sessionToken);
}

export async function removeItem(sessionToken: string, productId: number) {
  const { cart } = await getCartWithItems(sessionToken);
  await db.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  return getCartWithItems(sessionToken);
}

export async function clearCart(cartId: number) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export function computeCartTotal(items: { quantity: number; unitPrice: string; currency: string }[]) {
  const totalCents = items.reduce((acc, it) => acc + Math.round(parseFloat(it.unitPrice) * 100) * it.quantity, 0);
  const currency = items[0]?.currency ?? "USD";
  return { totalCents, currency, totalDecimal: (totalCents / 100).toFixed(2) };
}

export async function createOrderFromCart(sessionToken: string, email: string, providerSessionId?: string) {
  const { cart, items } = await getCartWithItems(sessionToken);
  if (items.length === 0) throw new Error("Cart is empty");
  const { totalDecimal, currency } = computeCartTotal(items);

  const orderRows = await db
    .insert(orders)
    .values({
      cartId: cart.id,
      email,
      total: asNumeric(totalDecimal),
      currency,
      status: "pending",
    })
    .returning();
  const order = orderRows[0];

  await db.insert(orderItems).values(
    items.map((it) => ({
      orderId: order.id,
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: asNumeric(it.unitPrice),
      currency: it.currency,
    }))
  );

  if (providerSessionId) {
    await db.insert(payments).values({
      orderId: order.id,
      provider: "stripe",
      providerSessionId,
      amount: asNumeric(totalDecimal),
      currency,
      status: "pending",
    });
  }

  return order;
}