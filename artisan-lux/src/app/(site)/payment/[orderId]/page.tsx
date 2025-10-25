import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import PaymentProofUpload from "@/components/site/PaymentProofUpload";

export const revalidate = 0;

async function getOrder(orderId: number) {
  const orderRow = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0];
  if (!orderRow) return null;

  const items = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      title: products.title,
      slug: products.slug,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, orderId));

  return { order: orderRow, items };
}

export default async function PaymentInstructionsPage(props: unknown) {
  const { params } = props as { params: Promise<{ orderId: string }> };
  const { orderId } = await params;
  const orderIdNum = parseInt(orderId, 10);

  const data = await getOrder(orderIdNum);

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white p-8 text-center">
        <h1 className="text-3xl font-serif mb-4">Order Not Found</h1>
        <Link href="/" className="underline text-[#cd7f32]">
          Back to Home
        </Link>
      </main>
    );
  }

  const { order, items } = data;

  // Payment details from environment
  const bankName = process.env.BANK_NAME || "Your Bank";
  const bankAccountName = process.env.BANK_ACCOUNT_NAME || "Account Holder";
  const bankAccountNumber = process.env.BANK_ACCOUNT_NUMBER || "123456789";
  const bankBranch = process.env.BANK_BRANCH || "Branch";
  const ecocashNumber = process.env.ECOCASH_NUMBER || "+263771234567";
  const ecocashName = process.env.ECOCASH_NAME || "Your Name";
  const onemoneyNumber = process.env.ONEMONEY_NUMBER;
  const innbucksNumber = process.env.INNBUCKS_NUMBER;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          Artisan Lux
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/orders/pending" className="hover:text-[#cd7f32] transition-colors">
            Pending Orders
          </Link>
          <Link href="/categories" className="hover:text-[#cd7f32] transition-colors">
            Categories
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500 rounded-lg mb-4">
            <span className="text-green-400 text-sm font-semibold">✓ Order Created</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Payment Instructions</h1>
          <p className="text-neutral-400 text-lg">Order #{order.id}</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-serif mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-neutral-300">
                  {item.title} × {item.quantity}
                </span>
                <span className="text-white font-semibold">
                  {Number(item.unitPrice).toFixed(2)} {order.currency}
                </span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="text-[#cd7f32] font-bold">
                {Number(order.total).toFixed(2)} {order.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-serif mb-4">Choose Payment Method</h2>

          {/* Bank Transfer */}
          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🏦</span> Bank Transfer
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Bank:</span>
                <span className="text-white font-semibold">{bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Account Name:</span>
                <span className="text-white font-semibold">{bankAccountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Account Number:</span>
                <span className="text-white font-semibold">{bankAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Branch:</span>
                <span className="text-white font-semibold">{bankBranch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Reference:</span>
                <span className="text-[#cd7f32] font-bold">ORD-{order.id}</span>
              </div>
            </div>
          </div>

          {/* EcoCash */}
          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📱</span> EcoCash
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Number:</span>
                <span className="text-white font-semibold">{ecocashNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Name:</span>
                <span className="text-white font-semibold">{ecocashName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Amount:</span>
                <span className="text-[#cd7f32] font-bold">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* OneMoney */}
          {onemoneyNumber && (
            <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💰</span> OneMoney
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Number:</span>
                  <span className="text-white font-semibold">{onemoneyNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* InnBucks */}
          {innbucksNumber && (
            <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💳</span> InnBucks
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Number:</span>
                  <span className="text-white font-semibold">{innbucksNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Proof */}
        {order.status === "pending" && (
          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-serif mb-4">Upload Proof of Payment</h2>
            <p className="text-neutral-400 text-sm mb-6">
              After making payment, upload a screenshot or photo of your payment confirmation.
            </p>
            <PaymentProofUpload orderId={order.id} />
          </div>
        )}

        {order.status === "paid" && (
          <div className="bg-green-600/20 border border-green-500 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">✓</div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">Payment Confirmed!</h3>
            <p className="text-neutral-300 text-sm">
              Your order has been confirmed. We will process it shortly.
            </p>
          </div>
        )}

        <div className="mt-8 text-center space-y-3">
          <div>
            <Link href="/orders/pending" className="text-[#cd7f32] underline">
              View All Pending Orders
            </Link>
          </div>
          <div>
            <Link href="/" className="text-[#cd7f32] underline">
              Return to Home
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux. Need help? Contact us.</p>
      </footer>
    </div>
  );
}
