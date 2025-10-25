import { db } from "@/db";
import { carts, cartItems, products, categories, orders, orderItems, payments, customers } from "@/db/schema";
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
  try {
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
  } catch (error: any) {
    console.error('[getOrCreateCartByToken] Database error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    throw new Error(`Failed query: ${error.message}\nparams: ${sessionToken},${email ?? 'null'}`);
  }
}

export async function getCartWithItems(sessionToken: string) {
  const cart = await getOrCreateCartByToken(sessionToken);

  const rawItems = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      currency: cartItems.currency,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));

  const items: CartItemView[] = [];
  for (const item of rawItems) {
    // Categories-first enrichment
    const cat = (await db
      .select({ slug: categories.slug, title: categories.name })
      .from(categories)
      .where(eq(categories.id, item.productId))
      .limit(1))[0];
    if (cat) {
      items.push({
        productId: item.productId,
        slug: cat.slug,
        title: cat.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency,
      });
      continue;
    }
    // Fallback to products (for legacy rows)
    const prod = (await db
      .select({ slug: products.slug, title: products.title })
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1))[0];
    if (prod) {
      items.push({
        productId: item.productId,
        slug: prod.slug,
        title: prod.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency,
      });
    }
  }

  return { cart, items } as const;
}

export async function addItemByProductSlug(sessionToken: string, slug: string, quantity: number = 1) {
  const { cart } = await getCartWithItems(sessionToken);

  // Categories-first lookup (primary data source)
  const category = (await db
    .select({ id: categories.id, slug: categories.slug, name: categories.name, priceDecimal: categories.priceDecimal, currency: categories.currency })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1))[0];

  let product: { id: number; slug: string; title: string; priceDecimal: any; currency: string | null } | null = null;
  if (category) {
    if (!category.priceDecimal) throw new Error(`Product "${category.name}" does not have a price set`);
    product = { id: category.id, slug: category.slug, title: category.name, priceDecimal: category.priceDecimal as any, currency: (category as any).currency ?? "USD" };
  }

  if (!product) throw new Error(`Product not found with slug: ${slug}`);

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
      currency: product.currency ?? "USD",
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

  // Find or create customer
  const existingCustomer = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  const customerId = existingCustomer[0]
    ? existingCustomer[0].id
    : (await db.insert(customers).values({ email, name: null }).returning())[0].id;

  const orderRows = await db
    .insert(orders)
    .values({
      customerId,
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
