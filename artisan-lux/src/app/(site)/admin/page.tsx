import Link from "next/link";
import OrderNotifications from "@/components/admin/OrderNotifications";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          Artisan Lux Admin
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-[#cd7f32] transition-colors">
            Back to Site
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-serif mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-neutral-400 text-sm">View all orders in real-time</p>
            <Link 
              href="/api/admin/orders/recent" 
              target="_blank"
              className="mt-4 inline-block px-4 py-2 bg-[#cd7f32] rounded text-sm hover:opacity-90 transition-opacity"
            >
              View Orders API
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-neutral-400 text-sm">Manage your product catalog</p>
            <Link 
              href="/categories" 
              className="mt-4 inline-block px-4 py-2 bg-[#cd7f32] rounded text-sm hover:opacity-90 transition-opacity"
            >
              View Products
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Payment Proofs</h2>
            <p className="text-neutral-400 text-sm">Browse recent uploads</p>
            <Link 
              href="/admin/payment-proofs" 
              className="mt-4 inline-block px-4 py-2 bg-[#cd7f32] rounded text-sm hover:opacity-90 transition-opacity"
            >
              View Proofs
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Notifications</h2>
            <p className="text-neutral-400 text-sm">Real-time order alerts enabled</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400">Live</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-6">
          <h2 className="text-2xl font-serif mb-4">Getting Started</h2>
          <div className="space-y-4 text-neutral-300">
            <p>
              <strong className="text-white">Real-time Order Notifications:</strong> Orders will appear in the top-right corner as customers complete purchases.
            </p>
            <p>
              <strong className="text-white">Setup Stripe Webhook:</strong> Configure your Stripe webhook to point to <code className="bg-black/40 px-2 py-1 rounded text-xs">/api/webhooks/stripe</code>
            </p>
            <p>
              <strong className="text-white">Monitor Orders:</strong> The notification system connects via Server-Sent Events (SSE) for instant updates.
            </p>
          </div>
        </div>
      </main>

      {/* Real-time notification component */}
      <OrderNotifications />

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux Admin Dashboard</p>
      </footer>
    </div>
  );
}
