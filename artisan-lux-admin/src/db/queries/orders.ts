import { db } from "../index";
import { orders, payments } from "../schema";
import { desc, eq, sql } from "drizzle-orm";

export async function createOrder(input: {
  customerId?: number | null;
  total: number;
  currency?: string;
}) {
  const [o] = await db
    .insert(orders)
    .values({
      customerId: input.customerId ?? null,
      total: input.total as any,
      currency: input.currency ?? "USD",
    })
    .returning();
  return o;
}

export async function listOrders(limit = 50, offset = 0) {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
  const [{ value: total }] = (await db.execute(sql`select count(*)::int as value from orders`)) as any;
  return { items: rows, total } as const;
}

export async function recordPayment(input: {
  orderId: number;
  provider: string;
  amount: number;
  currency?: string;
  providerSessionId?: string | null;
  providerIntentId?: string | null;
  status?: "created" | "requires_action" | "succeeded" | "failed";
}) {
  const [p] = await db
    .insert(payments)
    .values({
      orderId: input.orderId,
      provider: input.provider,
      amount: input.amount as any,
      currency: input.currency ?? "USD",
      providerSessionId: input.providerSessionId ?? null,
      providerIntentId: input.providerIntentId ?? null,
      status: input.status ?? "created",
    })
    .returning();
  return p;
}
