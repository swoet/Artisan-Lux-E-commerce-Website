import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems, customers, products, mediaAssets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata = {
  title: "Order History | Artisan Lux",
  description: "View your order history",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const cookieStore = await cookies();
  const email = searchParams.email || cookieStore.get("customer_email")?.value;

  if (!email) {
    redirect("/signin?redirect=/orders");
  }

  // First, get the customer ID from email
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);

  if (!customer) {
    redirect("/signin?redirect=/orders");
  }

  // Get orders for this customer
  const customerOrders = await db
    .select({
      id: orders.id,
      total: orders.total,
      currency: orders.currency,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <a href="/">
          <h1 className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent cursor-pointer">
            Artisan Lux
          </h1>
        </a>
        <div className="flex gap-6 text-sm">
          <Link href="/orders/pending" className="hover:text-[#cd7f32] transition-colors">
            Pending Orders
          </Link>
          <a href="/" className="hover:text-[#cd7f32] transition-colors">
            ← Back to Home
          </a>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="font-serif text-5xl font-bold mb-2 bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          Order History
        </h1>
        <p className="text-neutral-400 mb-12">View and track your orders</p>

        {customerOrders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-serif mb-4">No orders yet</h2>
            <p className="text-neutral-400 mb-8">Start exploring our curated collection</p>
            <a
              href="/categories"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#b87333]/20"
            >
              Browse Categories
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {customerOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function OrderCard({ order }: { order: { id: number; total: string; currency: string; status: string; createdAt: Date } }) {
  // Get order items with product details
  const items = await db
    .select({
      id: orderItems.id,
      productTitle: products.title,
      productSlug: products.slug,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      currency: orderItems.currency,
      coverImageUrl: mediaAssets.url,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
    .where(eq(orderItems.orderId, order.id));

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    paid: "bg-green-500/20 text-green-400 border-green-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    refunded: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  const statusColorClass = statusColor[order.status] || "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#cd7f32]/30 transition-all">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold mb-2 text-white">
            Order #{order.id}
          </h2>
          <p className="text-sm text-neutral-400">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${statusColorClass}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <p className="mt-3 text-2xl font-bold bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
            {order.currency} {parseFloat(order.total).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 mt-6">
        <h3 className="font-semibold text-lg mb-4 text-white">Order Items</h3>
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 italic">No items in this order yet</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-[#cd7f32]/30 transition-all">
              <div className="w-20 h-20 bg-black/30 rounded-lg overflow-hidden flex-shrink-0">
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.productTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <a
                  href={`/product/${item.productSlug}`}
                  className="font-medium text-white hover:text-[#cd7f32] transition-colors"
                >
                  {item.productTitle}
                </a>
                <p className="text-sm text-neutral-400 mt-1">
                  Qty: {item.quantity} × {item.currency}{" "}
                  {parseFloat(item.unitPrice).toFixed(2)}
                </p>
              </div>
              <div className="text-right font-semibold text-[#cd7f32]">
                {item.currency}{" "}
                {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
