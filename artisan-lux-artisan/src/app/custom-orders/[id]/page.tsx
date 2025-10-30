import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { artisanCustomOrders, customers, artisanCustomOrderMessages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import CustomOrderActions from "@/components/custom-orders/CustomOrderActions";
import CustomOrderTimeline from "@/components/custom-orders/CustomOrderTimeline";
import CustomOrderMessages from "@/components/custom-orders/CustomOrderMessages";

interface CustomOrderDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomOrderDetailPage({ params }: CustomOrderDetailProps) {
  const artisan = await requireArtisanAuth();
  const { id } = await params;

  // Fetch order details
  const [orderData] = await db
    .select({
      order: artisanCustomOrders,
      customer: customers,
    })
    .from(artisanCustomOrders)
    .leftJoin(customers, eq(artisanCustomOrders.customerId, customers.id))
    .where(
      and(
        eq(artisanCustomOrders.id, parseInt(id)),
        eq(artisanCustomOrders.artisanId, artisan.id)
      )
    )
    .limit(1);

  if (!orderData) {
    notFound();
  }

  const { order, customer } = orderData;
  const referenceImages = (((order as any)?.referenceImages ?? []) as string[]);

  // Fetch messages
  const messages = await db
    .select()
    .from(artisanCustomOrderMessages)
    .where(eq(artisanCustomOrderMessages.customOrderId, order.id))
    .orderBy(artisanCustomOrderMessages.createdAt);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <a href="/custom-orders" className="text-neutral-300 hover:text-neutral-100">
              ← Back
            </a>
            <div className="flex-1">
              <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">
                {order.title}
              </h1>
              <p className="text-sm text-neutral-400">
                Custom Order #{order.id}
              </p>
            </div>
            <span className={`badge ${
              order.status === "pending" ? "badge-warning" :
              order.status === "quoted" ? "badge-info" :
              order.status === "accepted" ? "badge-success" :
              order.status === "in_production" ? "badge-info" :
              order.status === "completed" ? "badge-success" :
              order.status === "delivered" ? "badge-success" :
              order.status === "cancelled" ? "badge-error" :
              "badge-warning"
            }`}>
              {order.status?.replace("_", " ")}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Request */}
            <div className="card">
              <h2 className="text-xl font-serif font-bold mb-4">Customer Request</h2>
              <p className="text-neutral-400 whitespace-pre-line mb-4">
                {order.description}
              </p>

              {/* Reference Images */}
              {referenceImages && referenceImages.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">Reference Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {referenceImages.map((url: string, index: number) => (
                      <div key={index} className="relative aspect-square bg-[var(--color-card)] rounded-lg overflow-hidden">
                        <Image src={url} alt={`Reference ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="card">
              <h2 className="text-xl font-serif font-bold mb-4">Requirements</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-400">Budget Range</div>
                  <div className="font-bold">${order.budgetMin} - ${order.budgetMax}</div>
                </div>
                {order.desiredCompletionDate && (
                  <div>
                    <div className="text-sm text-neutral-400">Desired Completion</div>
                    <div className="font-bold">
                      {new Date(order.desiredCompletionDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {order.preferredMaterials && order.preferredMaterials.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-sm text-neutral-400 mb-2">Preferred Materials</div>
                    <div className="flex flex-wrap gap-2">
                      {order.preferredMaterials.map((material, index) => (
                        <span key={index} className="badge badge-secondary">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Details (if quoted) */}
            {order.quotedPrice && (
              <div className="card">
                <h2 className="text-xl font-serif font-bold mb-4">Your Quote</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-400">Quoted Price</div>
                    <div className="text-2xl font-bold text-brand-dark-wood">
                      ${order.quotedPrice}
                    </div>
                  </div>
                  {order.estimatedCompletionDate && (
                    <div>
                      <div className="text-sm text-neutral-400">Estimated Completion</div>
                      <div className="font-bold">
                        {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {order.quoteNotes && (
                    <div className="col-span-2">
                      <div className="text-sm text-neutral-400 mb-1">Notes</div>
                      <p className="text-neutral-400">{order.quoteNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Production Timeline */}
            {order.status && ["accepted", "in_production", "completed", "delivered"].includes(order.status) && (
              <CustomOrderTimeline order={order} />
            )}

            {/* Messages */}
            <CustomOrderMessages orderId={order.id} messages={messages} artisanId={artisan.id} />
          </div>

          {/* Right Column - Customer & Actions */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="card">
              <h3 className="font-bold mb-4">Customer</h3>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-card)] flex items-center justify-center text-xl">
                  {customer?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <div className="font-bold">{customer?.name || "Anonymous"}</div>
                  <div className="text-sm text-neutral-400">{customer?.email}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <CustomOrderActions order={order} artisanId={artisan.id} />

            {/* Order Info */}
            <div className="card">
              <h3 className="font-bold mb-4">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-neutral-400">Created</div>
                  <div className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Last Updated</div>
                  <div className="font-medium">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                {order.acceptedAt && (
                  <div>
                    <div className="text-neutral-400">Accepted</div>
                    <div className="font-medium">
                      {new Date(order.acceptedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {order.completedAt && (
                  <div>
                    <div className="text-neutral-400">Completed</div>
                    <div className="font-medium">
                      {new Date(order.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
