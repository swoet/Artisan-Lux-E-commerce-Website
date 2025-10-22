import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, products, mediaAssets } from "@/db/schema";
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

  const customerOrders = await db
    .select({
      id: orders.id,
      total: orders.total,
      currency: orders.currency,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.email, email))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Order History</h1>

      {customerOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-6">You haven't placed any orders yet</p>
          <a
            href="/categories"
            className="inline-block bg-neutral-900 text-white px-6 py-3 rounded-md hover:bg-neutral-800"
          >
            Start Shopping
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
  );
}

async function OrderCard({ order }: { order: { id: number; total: string; currency: string; status: string; paymentMethod: string | null; createdAt: Date } }) {
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
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  const statusColorClass = statusColor[order.status] || "bg-neutral-100 text-neutral-800";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl font-semibold mb-2">
            Order #{order.id}
          </h2>
          <p className="text-sm text-neutral-500">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <p className="mt-2 font-semibold">
            {order.currency} {parseFloat(order.total).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <h3 className="font-medium mb-3">Items</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.productTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <a
                  href={`/product/${item.productSlug}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {item.productTitle}
                </a>
                <p className="text-sm text-neutral-500">
                  Qty: {item.quantity} × {item.currency}{" "}
                  {parseFloat(item.unitPrice).toFixed(2)}
                </p>
              </div>
              <div className="text-right font-medium">
                {item.currency}{" "}
                {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.paymentMethod && (
        <div className="border-t border-neutral-200 pt-4 mt-4">
          <p className="text-sm text-neutral-600">
            Payment Method: <span className="font-medium">{order.paymentMethod}</span>
          </p>
        </div>
      )}
    </div>
  );
}
