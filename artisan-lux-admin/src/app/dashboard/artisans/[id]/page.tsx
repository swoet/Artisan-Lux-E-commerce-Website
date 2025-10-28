import { db } from "@/db";
import { artisans, products, productArtisans, customOrders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApproveArtisanButton from "./ApproveArtisanButton";
import RejectArtisanButton from "./RejectArtisanButton";

export default async function ArtisanDetailPage({ params }: { params: { id: string } }) {
  const artisanId = parseInt(params.id);

  const [artisan] = await db
    .select()
    .from(artisans)
    .where(eq(artisans.id, artisanId))
    .limit(1);

  if (!artisan) {
    notFound();
  }

  // Get artisan's products
  const artisanProducts = await db
    .select({
      product: products,
    })
    .from(productArtisans)
    .innerJoin(products, eq(productArtisans.productId, products.id))
    .where(eq(productArtisans.artisanId, artisanId));

  // Get custom orders
  const orders = await db
    .select()
    .from(customOrders)
    .where(eq(customOrders.artisanId, artisanId));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard/artisans" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Artisans
          </Link>
          <h1 className="text-3xl font-bold">{artisan.name}</h1>
          <p className="text-gray-600">{artisan.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/artisans/${artisan.id}/edit`}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      {artisan.status === "pending" && artisan.emailVerified && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-orange-800 mb-2">
                ⏳ Pending Approval
              </h3>
              <p className="text-orange-700 mb-4">
                This artisan has verified their email and is waiting for account approval.
                Review their information and approve or reject their application.
              </p>
              <div className="flex gap-3">
                <ApproveArtisanButton artisanId={artisan.id} artisanName={artisan.name} artisanEmail={artisan.email} />
                <RejectArtisanButton artisanId={artisan.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {artisan.status === "pending" && !artisan.emailVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">
            📧 Email Not Verified
          </h3>
          <p className="text-yellow-700">
            This artisan has registered but hasn&apos;t verified their email yet.
          </p>
        </div>
      )}

      {artisan.status === "active" && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
          <h3 className="text-lg font-bold text-green-800 mb-2">
            ✅ Active Account
          </h3>
          <p className="text-green-700">
            This artisan&apos;s account is active and they can access the artisan portal.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Products</div>
          <div className="text-3xl font-bold">{artisanProducts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Custom Orders</div>
          <div className="text-3xl font-bold">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Sales</div>
          <div className="text-3xl font-bold">
            ${artisan.totalSales ? parseFloat(artisan.totalSales).toLocaleString() : "0"}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Commission Rate</div>
          <div className="text-3xl font-bold">
            {artisan.commissionRate ? parseFloat(artisan.commissionRate) : "15"}%
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{artisan.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {artisan.email}
                {artisan.emailVerified && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Studio Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{artisan.studioName || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Studio Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{artisan.studioLocation || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Specialties</dt>
              <dd className="mt-1">
                {artisan.specialties && artisan.specialties.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {artisan.specialties.map((specialty, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {specialty}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Website</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {artisan.website ? (
                  <a href={artisan.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {artisan.website}
                  </a>
                ) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Instagram</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {artisan.instagram ? (
                  <a href={`https://instagram.com/${artisan.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    @{artisan.instagram}
                  </a>
                ) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  artisan.status === "active" ? "bg-green-100 text-green-800" :
                  artisan.status === "pending" ? "bg-orange-100 text-orange-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {artisan.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(artisan.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          {artisan.bio ? (
            <p className="text-gray-700 whitespace-pre-wrap">{artisan.bio}</p>
          ) : (
            <p className="text-gray-500 italic">No bio provided</p>
          )}
        </div>
      </div>

      {/* Products */}
      {artisanProducts.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Products ({artisanProducts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {artisanProducts.slice(0, 6).map(({ product }) => (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.id}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900">{product.title}</h3>
                <p className="text-sm text-gray-500 mt-1">${product.price}</p>
              </Link>
            ))}
          </div>
          {artisanProducts.length > 6 && (
            <div className="mt-4 text-center">
              <Link href={`/dashboard/products?artisan=${artisan.id}`} className="text-blue-600 hover:underline">
                View all {artisanProducts.length} products →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
