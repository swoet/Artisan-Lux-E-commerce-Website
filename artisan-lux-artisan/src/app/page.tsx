import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { products, productArtisans, customOrders, orders, orderItems } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const artisan = await requireArtisanAuth();

  // Fetch dashboard stats
  const [stats] = await db
    .select({
      totalProducts: sql<number>`count(distinct ${products.id})`,
      activeOrders: sql<number>`count(distinct case when ${customOrders.status} in ('accepted', 'in_production') then ${customOrders.id} end)`,
      pendingQuotes: sql<number>`count(distinct case when ${customOrders.status} = 'draft' then ${customOrders.id} end)`,
      totalSales: sql<string>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(products)
    .leftJoin(productArtisans, eq(products.id, productArtisans.productId))
    .leftJoin(customOrders, eq(customOrders.artisanId, artisan.id))
    .leftJoin(orderItems, eq(orderItems.productId, products.id))
    .leftJoin(orders, eq(orders.id, orderItems.orderId))
    .where(eq(productArtisans.artisanId, artisan.id));

  // Fetch recent custom orders
  const recentOrders = await db
    .select({
      id: customOrders.id,
      status: customOrders.status,
      totalPrice: customOrders.totalPrice,
      createdAt: customOrders.createdAt,
      baseProduct: products.title,
    })
    .from(customOrders)
    .leftJoin(products, eq(customOrders.baseProductId, products.id))
    .where(eq(customOrders.artisanId, artisan.id))
    .orderBy(desc(customOrders.createdAt))
    .limit(5);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">
                Artisan Portal
              </h1>
              <p className="text-sm text-neutral-400">Welcome back, {artisan.name}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="btn btn-secondary">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/" className="py-4 border-b-2 border-brand-dark-wood font-medium text-brand-dark-wood">
              Dashboard
            </Link>
            <Link href="/products" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Products
            </Link>
            <Link href="/orders" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Orders
            </Link>
            <Link href="/custom-orders" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Custom Orders
            </Link>
            <Link href="/analytics" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Analytics
            </Link>
            <Link href="/profile" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Total Products</div>
            <div className="text-3xl font-bold text-brand-dark-wood">{stats.totalProducts}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Active Orders</div>
            <div className="text-3xl font-bold text-success">{stats.activeOrders}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Pending Quotes</div>
            <div className="text-3xl font-bold text-warning">{stats.pendingQuotes}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Total Sales</div>
            <div className="text-3xl font-bold text-brand-dark-wood">
              ${parseFloat(stats.totalSales).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold">Recent Custom Orders</h2>
            <Link href="/custom-orders" className="text-sm text-brand-dark-wood hover:underline">
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>No custom orders yet</p>
              <p className="text-sm mt-2">Custom orders will appear here when customers request them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-[var(--color-card)] rounded-lg">
                  <div>
                    <div className="font-medium">{order.baseProduct || "Custom Request"}</div>
                    <div className="text-sm text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${
                      order.status === "accepted" || order.status === "in_production" ? "badge-success" :
                      order.status === "draft" ? "badge-warning" :
                      order.status === "completed" ? "badge-info" :
                      "badge-error"
                    }`}>
                      {order.status}
                    </span>
                    <div className="font-medium">${order.totalPrice}</div>
                    <Link href={`/custom-orders/${order.id}`} className="btn btn-secondary text-sm py-2">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/products/new" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-serif font-bold text-lg mb-2">Create Product</h3>
            <p className="text-sm text-neutral-400">Add a new product to your collection</p>
          </Link>
          <Link href="/custom-orders?filter=pending" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-serif font-bold text-lg mb-2">Review Quotes</h3>
            <p className="text-sm text-neutral-400">Respond to custom order requests</p>
          </Link>
          <Link href="/profile" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-serif font-bold text-lg mb-2">Update Profile</h3>
            <p className="text-sm text-neutral-400">Edit your studio information</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
