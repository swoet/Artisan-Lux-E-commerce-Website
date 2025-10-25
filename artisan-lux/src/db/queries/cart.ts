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
  
  // Get cart items with product details from both products and categories tables
  const rawItems = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      currency: cartItems.currency,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));

  // Enrich with product/category details
  const items: CartItemView[] = [];
  for (const item of rawItems) {
    // Try products table first
    let productData = (await db.select().from(products).where(eq(products.id, item.productId)).limit(1))[0];
    
    if (!productData) {
      // Try categories table (categories are used as products)
      const categoryData = (await db.select().from(categories).where(eq(categories.id, item.productId)).limit(1))[0];
      if (categoryData) {
        productData = {
          slug: categoryData.slug,
          title: categoryData.name,
        } as any;
      }
    }
    
    if (productData) {
      items.push({
        productId: item.productId,
        slug: productData.slug,
        title: productData.title,
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
  
  // Try to find in products table first, then categories table (categories are used as products)
  let product = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  
  if (!product) {
    // Look in categories table (categories with priceDecimal are sellable products)
    const category = (await db.select().from(categories).where(eq(categories.slug, slug)).limit(1))[0];
    if (!category || !category.priceDecimal) {
      throw new Error("Product not found");
    }
    // Map category to product-like structure
    product = {
      id: category.id,
      slug: category.slug,
      title: category.name,
      priceDecimal: category.priceDecimal,
      currency: category.currency,
    } as any;
  }

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
