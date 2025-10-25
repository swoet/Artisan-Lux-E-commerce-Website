import Link from "next/link";

export const revalidate = 0;

export default async function AdminPaymentProofsPage() {
  async function getProofs() {
    try {
      const res = await fetch("/api/admin/payment-proofs/recent", { cache: "no-store" });
      if (!res.ok) return [] as any[];
      const data = await res.json();
      return data.proofs || [];
    } catch {
      return [] as any[];
    }
  }

  const proofs = await getProofs();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          Artisan Lux Admin
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/admin" className="hover:text-[#cd7f32] transition-colors">Dashboard</Link>
          <Link href="/" className="hover:text-[#cd7f32] transition-colors">Site</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-8">
          <h1 className="text-4xl md:text-6xl font-serif">Payment Proofs</h1>
          <p className="text-neutral-400 mt-2">Recent uploads from customers</p>
        </header>

        {proofs.length === 0 ? (
          <div className="p-8 bg-white/5 border border-white/10 rounded-lg text-neutral-300">
            No payment proofs yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-neutral-300">
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
                {proofs.map((p: any) => (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">#{p.orderId}</td>
                    <td className="px-4 py-3">{p.email || "-"}</td>
                    <td className="px-4 py-3">{p.currency} {p.total ? parseFloat(p.total).toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{p.paymentMethod || "-"}</td>
                    <td className="px-4 py-3">
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-[#cd7f32] hover:underline">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux Admin Dashboard</p>
      </footer>
    </div>
  );
}
