import Link from "next/link";
import { db } from "@/db";
import { orders, payments, customers, paymentProofs } from "@/db/schema";
import { desc, eq, or, ne } from "drizzle-orm";

export const revalidate = 0;

export default async function PaymentsPage() {
  // Pending payments: order status pending OR payment not succeeded
  const pending = await db
    .select({
      orderId: orders.id,
      email: customers.email,
      total: orders.total,
      currency: orders.currency,
      orderStatus: orders.status,
      paymentStatus: payments.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .leftJoin(customers, eq(customers.id, orders.customerId))
    .where(or(eq(orders.status, "pending"), ne(payments.status, "succeeded")));

  const proofs = await db
    .select({
      id: paymentProofs.id,
      uploadedAt: paymentProofs.uploadedAt,
      url: paymentProofs.url,
      paymentMethod: paymentProofs.paymentMethod,
      orderId: orders.id,
      total: orders.total,
      currency: orders.currency,
      email: customers.email,
    })
    .from(paymentProofs)
    .leftJoin(orders, eq(orders.id, paymentProofs.orderId))
    .leftJoin(customers, eq(customers.id, orders.customerId))
    .orderBy(desc(paymentProofs.uploadedAt))
    .limit(50);

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif">Payments</h1>
        <p className="text-sm text-[var(--color-fg)]/70 mt-2">Pending payments and customer-uploaded proofs</p>
      </header>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Pending</h2>
          <span className="text-sm text-[var(--color-fg)]/70">{pending.length} total</span>
        </div>
        {pending.length === 0 ? (
          <div className="p-6 rounded-lg border border-[var(--color-border)] bg-white/5 text-[var(--color-fg)]/80">No pending payments</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-[var(--color-fg)]/70">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Order Status</th>
                  <th className="px-4 py-3 text-left">Payment Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row, idx) => (
                  <tr key={`${row.orderId}-${idx}`} className="border-t border-[var(--color-border)]/70">
                    <td className="px-4 py-3">#{row.orderId}</td>
                    <td className="px-4 py-3">{row.email || "-"}</td>
                    <td className="px-4 py-3">{row.currency} {row.total ? parseFloat(String(row.total)).toFixed(2) : "-"}</td>
                    <td className="px-4 py-3 capitalize">{row.orderStatus}</td>
                    <td className="px-4 py-3 capitalize">{row.paymentStatus || "-"}</td>
                    <td className="px-4 py-3">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Payment Proofs</h2>
          <span className="text-sm text-[var(--color-fg)]/70">{proofs.length} recent</span>
        </div>
        {proofs.length === 0 ? (
          <div className="p-6 rounded-lg border border-[var(--color-border)] bg-white/5 text-[var(--color-fg)]/80">No proofs uploaded</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-[var(--color-fg)]/70">
                <tr>
                  <th className="px-4 py-3 text-left">Uploaded</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Proof</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((p) => (
                  <tr key={p.id} className="border-t border-[var(--color-border)]/70">
                    <td className="px-4 py-3">{p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">#{p.orderId}</td>
                    <td className="px-4 py-3">{p.email || "-"}</td>
                    <td className="px-4 py-3">{p.currency} {p.total ? parseFloat(String(p.total)).toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{p.paymentMethod || "-"}</td>
                    <td className="px-4 py-3"><a href={p.url} target="_blank" rel="noreferrer" className="text-[var(--brand-to)] hover:underline">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8 text-sm text-[var(--color-fg)]/70">
        <Link href="/" className="hover:text-[var(--brand-to)]">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
