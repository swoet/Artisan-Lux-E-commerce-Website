import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems, customers, categories, mediaAssets, paymentProofs } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export const metadata = {
  title: "Pending Orders | Artisan Lux",
  description: "Orders awaiting payment proof",
};

export default async function PendingOrdersPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const cookieStore = await cookies();
  const email = searchParams.email || cookieStore.get("customer_email")?.value;

  if (!email) {
    redirect("/signin?redirect=/orders/pending");
  }

  // Get customer
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);

  if (!customer) {
    redirect("/signin?redirect=/orders/pending");
  }

  // Get all orders for this customer
  const allOrders = await db
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

  // Get all payment proofs for these orders
  const orderIds = allOrders.map((o) => o.id);
  const proofsMap = new Map<number, boolean>();
  
  if (orderIds.length > 0) {
    const proofs = await db
      .select({ orderId: paymentProofs.orderId })
      .from(paymentProofs)
      .where(inArray(paymentProofs.orderId, orderIds));
    
    proofs.forEach((p) => proofsMap.set(p.orderId, true));
  }

  // Filter: only pending orders without proof
  const pendingOrders = allOrders.filter(
    (o) => o.status === "pending" && !proofsMap.has(o.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/">
          <h1 className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent cursor-pointer">
            Artisan Lux
          </h1>
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/orders" className="hover:text-[#cd7f32] transition-colors">All Orders</Link>
          <Link href="/" className="hover:text-[#cd7f32] transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="font-serif text-5xl font-bold mb-2 bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          Pending Orders
        </h1>
        <p className="text-neutral-400 mb-12">Orders awaiting payment proof upload</p>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-serif mb-4">All caught up!</h2>
            <p className="text-neutral-400 mb-8">You have no pending orders waiting for payment proof.</p>
            <Link
              href="/orders"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#b87333]/20"
            >
              View All Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingOrders.map((order) => (
              <PendingOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function PendingOrderCard({ order }: { order: { id: number; total: string; currency: string; status: string; createdAt: Date } }) {
  // Get order items with product details
  const items = await db
    .select({
      id: orderItems.id,
      productTitle: categories.name,
      productSlug: categories.slug,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      currency: orderItems.currency,
      coverImageUrl: mediaAssets.url,
    })
    .from(orderItems)
    .innerJoin(categories, eq(orderItems.productId, categories.id))
    .leftJoin(mediaAssets, eq(categories.coverImageId, mediaAssets.id))
    .where(eq(orderItems.orderId, order.id));

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
          <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Awaiting Proof
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
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
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
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="font-medium text-white hover:text-[#cd7f32] transition-colors"
                  >
                    {item.productTitle}
                  </Link>
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

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-neutral-400 text-sm">
            Please upload your payment proof to complete this order
          </p>
          <Link
            href={`/payment/${order.id}`}
            className="px-6 py-3 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#b87333]/20"
          >
            Upload Payment Proof
          </Link>
        </div>
      </div>
    </div>
  );
}
