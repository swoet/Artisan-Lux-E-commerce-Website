import { db } from "@/db";
import { artisans, artisanSessions, customOrders, products, productArtisans } from "@/db/schema";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import Link from "next/link";

export default async function ArtisanPortalManagementPage() {
  // Get all artisans with stats
  const allArtisans = await db
    .select()
    .from(artisans)
    .orderBy(desc(artisans.createdAt));

  // Get active sessions (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeSessions = await db
    .select()
    .from(artisanSessions)
    .where(gte(artisanSessions.createdAt, sevenDaysAgo));

  // Get custom orders stats
  const orders = await db.select().from(customOrders);

  // Get products by artisans
  const artisanProducts = await db
    .select({
      artisanId: productArtisans.artisanId,
      count: sql<number>`count(*)`,
    })
    .from(productArtisans)
    .groupBy(productArtisans.artisanId);

  // Calculate stats
  const totalArtisans = allArtisans.length;
  const pendingArtisans = allArtisans.filter(a => a.status === "pending").length;
  const activeArtisans = allArtisans.filter(a => a.status === "active").length;
  const verifiedArtisans = allArtisans.filter(a => a.emailVerified).length;
  const unverifiedArtisans = allArtisans.filter(a => !a.emailVerified).length;
  const activeSessionsCount = activeSessions.length;
  const pendingOrders = orders.filter(o => o.status === "draft" || o.status === "quoted").length;
  const totalProducts = artisanProducts.reduce((sum, ap) => sum + Number(ap.count), 0);

  // Recent registrations (last 7 days)
  const recentRegistrations = allArtisans.filter(
    a => new Date(a.createdAt) > sevenDaysAgo
  );

  // Artisans needing attention
  const needsAttention = allArtisans.filter(
    a => a.status === "pending" && a.emailVerified
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Artisan Portal Management</h1>
        <p className="text-gray-400">Monitor and manage the artisan portal application</p>
      </div>

      {/* Alert for pending approvals */}
      {needsAttention.length > 0 && (
        <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-orange-300 mb-2">
                ⚠️ {needsAttention.length} Artisan{needsAttention.length !== 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-orange-200 mb-4">
                These artisans have verified their email and are waiting for account activation.
              </p>
              <Link
                href="/dashboard/artisans"
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                Review Applications →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-lg p-6">
          <div className="text-sm text-blue-300 mb-1">Total Artisans</div>
          <div className="text-3xl font-bold text-blue-100">{totalArtisans}</div>
          <div className="text-xs text-blue-400 mt-2">All registered accounts</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-lg p-6">
          <div className="text-sm text-green-300 mb-1">Active Artisans</div>
          <div className="text-3xl font-bold text-green-100">{activeArtisans}</div>
          <div className="text-xs text-green-400 mt-2">Approved accounts</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/50 rounded-lg p-6">
          <div className="text-sm text-orange-300 mb-1">Pending Approval</div>
          <div className="text-3xl font-bold text-orange-100">{pendingArtisans}</div>
          <div className="text-xs text-orange-400 mt-2">Awaiting review</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
          <div className="text-sm text-purple-300 mb-1">Active Sessions</div>
          <div className="text-3xl font-bold text-purple-100">{activeSessionsCount}</div>
          <div className="text-xs text-purple-400 mt-2">Last 7 days</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Email Verified</div>
          <div className="text-2xl font-bold">{verifiedArtisans}</div>
          <div className="text-xs text-gray-500 mt-1">
            {unverifiedArtisans} unverified
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Recent Signups</div>
          <div className="text-2xl font-bold">{recentRegistrations.length}</div>
          <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Custom Orders</div>
          <div className="text-2xl font-bold">{orders.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {pendingOrders} pending
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Products</div>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <div className="text-xs text-gray-500 mt-1">By artisans</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">👥 Artisan Management</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/artisans"
              className="block p-3 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
            >
              <div className="font-medium">View All Artisans</div>
              <div className="text-sm text-gray-400">Manage accounts and profiles</div>
            </Link>
            <Link
              href="/dashboard/artisans?filter=pending"
              className="block p-3 bg-orange-900/20 rounded hover:bg-orange-900/30 transition-colors"
            >
              <div className="font-medium text-orange-300">Pending Approvals</div>
              <div className="text-sm text-orange-400">{pendingArtisans} waiting</div>
            </Link>
            <Link
              href="/dashboard/artisans?filter=unverified"
              className="block p-3 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
            >
              <div className="font-medium">Unverified Emails</div>
              <div className="text-sm text-gray-400">{unverifiedArtisans} accounts</div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">📦 Content Management</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/custom-orders"
              className="block p-3 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
            >
              <div className="font-medium">Custom Orders</div>
              <div className="text-sm text-gray-400">{orders.length} total orders</div>
            </Link>
            <Link
              href="/dashboard/products?filter=artisan"
              className="block p-3 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
            >
              <div className="font-medium">Artisan Products</div>
              <div className="text-sm text-gray-400">{totalProducts} products</div>
            </Link>
            <Link
              href="/dashboard/artisan-profiles"
              className="block p-3 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
            >
              <div className="font-medium">Artisan Profiles</div>
              <div className="text-sm text-gray-400">Public portfolios</div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">⚙️ Portal Settings</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-800/50 rounded">
              <div className="font-medium">Portal URL</div>
              <div className="text-sm text-gray-400 break-all">
                {process.env.NEXT_PUBLIC_ARTISAN_URL || 'Not configured'}
              </div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <div className="font-medium">Email Service</div>
              <div className="text-sm text-gray-400">
                {process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}
              </div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <div className="font-medium">Database</div>
              <div className="text-sm text-gray-400">
                {process.env.DATABASE_URL ? '✅ Connected' : '❌ Not connected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold mb-4">📊 Recent Activity</h3>
        
        {recentRegistrations.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Recent Registrations (Last 7 Days)
            </h4>
            {recentRegistrations.slice(0, 5).map((artisan) => (
              <div key={artisan.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    artisan.emailVerified ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <div className="font-medium">{artisan.name}</div>
                    <div className="text-sm text-gray-400">{artisan.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${
                    artisan.status === 'active' ? 'bg-green-900/30 text-green-300' :
                    artisan.status === 'pending' ? 'bg-orange-900/30 text-orange-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {artisan.status}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(artisan.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent registrations in the last 7 days
          </div>
        )}
      </div>

      {/* System Health */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">🏥 System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="font-medium text-green-300">Portal Status</div>
            </div>
            <div className="text-sm text-green-400">Operational</div>
          </div>

          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="font-medium text-green-300">Database</div>
            </div>
            <div className="text-sm text-green-400">Connected</div>
          </div>

          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="font-medium text-green-300">Email Service</div>
            </div>
            <div className="text-sm text-green-400">
              {process.env.RESEND_API_KEY ? 'Active' : 'Not configured'}
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="font-medium text-blue-300">Active Sessions</div>
            </div>
            <div className="text-sm text-blue-400">{activeSessionsCount} sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
