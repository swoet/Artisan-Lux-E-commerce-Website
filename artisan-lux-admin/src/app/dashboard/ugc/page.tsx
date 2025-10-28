import { db } from "@/db";
import { userContent, products, customers, mediaAssets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function UGCModerationPage() {
  const ugcPosts = await db
    .select({
      ugc: userContent,
      product: products,
      customer: customers,
      media: mediaAssets,
    })
    .from(userContent)
    .leftJoin(products, eq(userContent.productId, products.id))
    .leftJoin(customers, eq(userContent.customerId, customers.id))
    .leftJoin(mediaAssets, eq(userContent.mediaId, mediaAssets.id))
    .orderBy(desc(userContent.createdAt))
    .limit(100);

  const pendingCount = ugcPosts.filter(p => p.ugc.status === "pending").length;
  const approvedCount = ugcPosts.filter(p => p.ugc.status === "approved").length;
  const rejectedCount = ugcPosts.filter(p => p.ugc.status === "rejected").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UGC Moderation</h1>
        <p className="text-gray-600">Review and approve customer-submitted content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
          <div className="text-3xl font-bold">{ugcPosts.length}</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="text-sm text-orange-600 mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600 mb-1">Approved</div>
          <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="text-sm text-red-600 mb-1">Rejected</div>
          <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
        </div>
      </div>

      {/* UGC Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">All Submissions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ugcPosts.map(({ ugc, product, customer, media }) => (
            <div key={ugc.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {media?.url && (
                  <Image
                    src={media.url}
                    alt={ugc.caption || "UGC"}
                    fill
                    className="object-cover"
                  />
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    ugc.status === "pending" ? "bg-orange-100 text-orange-800" :
                    ugc.status === "approved" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {ugc.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {ugc.caption || "No caption"}
                </p>
                
                <div className="text-xs text-gray-500 mb-3">
                  <div>By: {customer?.name || "Anonymous"}</div>
                  <div>{new Date(ugc.createdAt).toLocaleDateString()}</div>
                  {product && <div>Product: {product.title}</div>}
                </div>

                {/* Actions */}
                {ugc.status === "pending" && (
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700">
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white text-xs py-2 rounded hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                )}
                
                {ugc.status === "approved" && (
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700">
                      Feature
                    </button>
                    <button className="flex-1 bg-gray-600 text-white text-xs py-2 rounded hover:bg-gray-700">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
