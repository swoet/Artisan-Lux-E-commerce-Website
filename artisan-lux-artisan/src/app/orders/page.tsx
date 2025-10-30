import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, productArtisans } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import TopNav from "@/components/TopNav";

export default async function OrdersPage() {
  const artisan = await requireArtisanAuth();

  const rows = await db
    .select({
      id: orders.id,
      total: orders.total,
      createdAt: orders.createdAt,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(productArtisans, eq(orderItems.productId, productArtisans.productId))
    .where(eq(productArtisans.artisanId, artisan.id))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">Orders</h1>
          <p className="text-sm text-neutral-400">Orders containing your products</p>
        </div>
      </header>

      {/* Navigation */}
      <TopNav />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rows.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🧾</div>
            <h2 className="text-xl font-serif font-bold mb-2">No Orders Yet</h2>
            <p className="text-neutral-400">Orders that include your products will appear here.</p>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-serif font-bold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>{o.itemCount}</td>
                      <td className="font-bold text-brand-dark-wood">${parseFloat(String(o.total)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
