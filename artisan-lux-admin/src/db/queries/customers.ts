import { db } from "../index";
import { customers, authEvents } from "../schema";
import { desc, sql, count } from "drizzle-orm";

export async function createCustomer(input: { email: string; name?: string | null }) {
  const [c] = await db
    .insert(customers)
    .values({ email: input.email, name: input.name ?? null })
    .returning();
  return c;
}

export async function listCustomers(opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? 50, 200);
  const offset = opts?.offset ?? 0;
  const rows = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.createdAt))
    .limit(limit)
    .offset(offset);

  // Use a driver-agnostic way to fetch the total count to avoid destructuring errors
  // Prefer Drizzle's count() for portability; fallback to db.execute rows if needed.
  let total = 0 as number;
  try {
    const [{ value }] = (await db.select({ value: count() }).from(customers)) as any;
    total = Number(value) || 0;
  } catch {
    const exec = (await db.execute(sql`select count(*)::int as value from customers`)) as any;
    const resultRows = exec?.rows ?? exec;
    const [{ value }] = resultRows as any[];
    total = Number(value) || 0;
  }

  return { items: rows, total } as const;
}

export async function recordAuthEvent(input: {
  customerId: number | null;
  type: "register" | "login";
  ip?: string | null;
  userAgent?: string | null;
}) {
  const [e] = await db
    .insert(authEvents)
    .values({
      customerId: input.customerId ?? null,
      type: input.type,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning();
  return e;
}

export async function recentAuthEvents(limit = 50) {
  const rows = await db.select().from(authEvents).orderBy(desc(authEvents.createdAt)).limit(limit);
  return rows;
}
