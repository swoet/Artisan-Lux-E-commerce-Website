import { db } from "@/db";
import { artisans } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function ArtisansManagementPage() {
  const allArtisans = await db
    .select()
    .from(artisans)
    .orderBy(desc(artisans.createdAt));

  const pendingCount = allArtisans.filter(a => a.status === "pending").length;
  const activeCount = allArtisans.filter(a => a.status === "active").length;
  const suspendedCount = allArtisans.filter(a => a.status === "suspended").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Artisan Management</h1>
        <p className="text-gray-600">Manage artisan accounts and applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Artisans</div>
          <div className="text-3xl font-bold">{allArtisans.length}</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="text-sm text-orange-600 mb-1">Pending Approval</div>
          <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="text-sm text-red-600 mb-1">Suspended</div>
          <div className="text-3xl font-bold text-red-600">{suspendedCount}</div>
        </div>
      </div>

      {/* Artisans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">All Artisans</h2>
          <Link href="/dashboard/artisans/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Artisan
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialties</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allArtisans.map((artisan) => (
                <tr key={artisan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{artisan.name}</div>
                    <div className="text-sm text-gray-500">{artisan.studioName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {artisan.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {artisan.emailVerified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {artisan.specialties?.slice(0, 2).map((specialty, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {specialty}
                        </span>
                      ))}
                      {artisan.specialties && artisan.specialties.length > 2 && (
                        <span className="text-xs text-gray-500">+{artisan.specialties.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      artisan.status === "active" ? "bg-green-100 text-green-800" :
                      artisan.status === "pending" ? "bg-orange-100 text-orange-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {artisan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${artisan.totalSales ? parseFloat(artisan.totalSales).toLocaleString() : "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/artisans/${artisan.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      {artisan.status === "pending" ? "Review" : "View"}
                    </Link>
                    <Link href={`/dashboard/artisans/${artisan.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
