import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { customOrders, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import TopNav from "@/components/TopNav";

export default async function CustomOrdersPage() {
  const artisan = await requireArtisanAuth();

  // Fetch custom orders for this artisan
  const orders = await db
    .select({
      order: customOrders,
      customer: customers,
    })
    .from(customOrders)
    .leftJoin(customers, eq(customOrders.customerId, customers.id))
    .where(eq(customOrders.artisanId, artisan.id))
    .orderBy(desc(customOrders.createdAt));

  const pendingOrders = orders.filter(o => o.order.status === "pending");
  const activeOrders = orders.filter(o => ["quoted", "accepted", "in_production"].includes(o.order.status || ""));
  const completedOrders = orders.filter(o => ["completed", "delivered"].includes(o.order.status || ""));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">
            Custom Orders
          </h1>
          <p className="text-sm text-neutral-400">Manage customer requests and commissions</p>
        </div>
      </header>

      {/* Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-orange-600">{pendingOrders.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Active Projects</div>
            <div className="text-3xl font-bold text-blue-600">{activeOrders.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-neutral-400 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-600">{completedOrders.length}</div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-serif font-bold mb-4">Pending Requests</h2>
            <div className="space-y-4">
              {pendingOrders.map(({ order, customer }) => (
                <Link
                  key={order.id}
                  href={`/custom-orders/${order.id}`}
                  className="card hover:shadow-lg transition-shadow block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold text-lg">{order.title}</div>
                        <span className="badge badge-warning">New Request</span>
                      </div>
                      <p className="text-neutral-400 mb-3 line-clamp-2">{order.description}</p>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span>👤 {customer?.name || "Anonymous"}</span>
                        <span>💰 Budget: ${order.budgetMin} - ${order.budgetMax}</span>
                        <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-brand-dark-wood">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active Projects */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-serif font-bold mb-4">Active Projects</h2>
            <div className="space-y-4">
              {activeOrders.map(({ order, customer }) => (
                <Link
                  key={order.id}
                  href={`/custom-orders/${order.id}`}
                  className="card hover:shadow-lg transition-shadow block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold text-lg">{order.title}</div>
                        <span className={`badge ${
                          order.status === "in_production" ? "badge-info" :
                          order.status === "accepted" ? "badge-success" :
                          "badge-warning"
                        }`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-neutral-400 mb-3 line-clamp-2">{order.description}</p>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span>👤 {customer?.name || "Anonymous"}</span>
                        {order.quotedPrice && <span>💰 ${order.quotedPrice}</span>}
                        {order.estimatedCompletionDate && (
                          <span>📅 Due: {new Date(order.estimatedCompletionDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-brand-dark-wood">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-serif font-bold mb-4">Completed Orders</h2>
            <div className="space-y-4">
              {completedOrders.map(({ order, customer }) => (
                <Link
                  key={order.id}
                  href={`/custom-orders/${order.id}`}
                  className="card hover:shadow-lg transition-shadow block opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold text-lg">{order.title}</div>
                        <span className="badge badge-success">
                          {order.status === "delivered" ? "Delivered" : "Completed"}
                        </span>
                      </div>
                      <p className="text-neutral-400 mb-3 line-clamp-2">{order.description}</p>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span>👤 {customer?.name || "Anonymous"}</span>
                        {order.quotedPrice && <span>💰 ${order.quotedPrice}</span>}
                        <span>✓ {new Date(order.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-serif font-bold mb-2">No Custom Orders Yet</h2>
            <p className="text-neutral-400">Custom order requests from customers will appear here</p>
          </div>
        )}
      </main>
    </div>
  );
}
