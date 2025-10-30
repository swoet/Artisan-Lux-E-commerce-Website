import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, productArtisans, products, artisanCustomOrders } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const artisan = await requireArtisanAuth();

  // Total items sold (count of order items that belong to this artisan)
  const [{ itemsSold }] = await db
    .select({ itemsSold: sql<number>`count(${orderItems.id})` })
    .from(orderItems)
    .innerJoin(productArtisans, eq(orderItems.productId, productArtisans.productId))
    .where(eq(productArtisans.artisanId, artisan.id));

  // Orders containing this artisan's products (distinct order count)
  const [{ ordersCount }] = await db
    .select({ ordersCount: sql<number>`count(distinct ${orders.id})` })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(productArtisans, eq(orderItems.productId, productArtisans.productId))
    .where(eq(productArtisans.artisanId, artisan.id));

  // Top products by items sold
  const topProducts = await db
    .select({
      id: products.id,
      title: products.title,
      count: sql<number>`count(${orderItems.id})`,
    })
    .from(products)
    .innerJoin(productArtisans, eq(products.id, productArtisans.productId))
    .leftJoin(orderItems, eq(orderItems.productId, products.id))
    .where(eq(productArtisans.artisanId, artisan.id))
    .groupBy(products.id)
    .orderBy(desc(sql`count(${orderItems.id})`))
    .limit(5);

  // Custom order status breakdown
  const customOrderRows = await db
    .select({
      status: artisanCustomOrders.status,
      count: sql<number>`count(${artisanCustomOrders.id})`,
    })
    .from(artisanCustomOrders)
    .where(eq(artisanCustomOrders.artisanId, artisan.id))
    .groupBy(artisanCustomOrders.status);

  const statusMap = new Map<string, number>();
  for (const r of customOrderRows) statusMap.set(r.status ?? "unknown", r.count as number);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">Analytics</h1>
          <p className="text-sm text-neutral-400">Sales and activity for your products</p>
        </div>
      </header>

      {/* Navigation */}
      <TopNav />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Orders</div>
            <div className="text-3xl font-bold text-brand-dark-wood">{ordersCount}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Items Sold</div>
            <div className="text-3xl font-bold text-brand-dark-wood">{itemsSold}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Custom Orders</div>
            <div className="text-3xl font-bold text-brand-dark-wood">{Array.from(statusMap.values()).reduce((a,b)=>a+b,0)}</div>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-xl font-serif font-bold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <div className="text-neutral-400">No sales yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-neutral-400">{p.count} sold</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Orders Breakdown */}
        <div className="card">
          <h2 className="text-xl font-serif font-bold mb-4">Custom Orders Status</h2>
          {statusMap.size === 0 ? (
            <div className="text-neutral-400">No custom orders yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from(statusMap.entries()).map(([status, count]) => (
                <div key={status} className="p-4 bg-[var(--color-card)] rounded">
                  <div className="text-sm text-neutral-400">{status.replaceAll("_"," ")}</div>
                  <div className="text-2xl font-bold text-brand-dark-wood">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
