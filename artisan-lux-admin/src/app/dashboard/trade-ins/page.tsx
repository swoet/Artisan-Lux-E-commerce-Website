import { db } from "@/db";
import { tradeIns, products, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function TradeInsAdminPage() {
  const submissions = await db
    .select({
      tradeIn: tradeIns,
      product: products,
      customer: customers,
    })
    .from(tradeIns)
    .leftJoin(products, eq(tradeIns.productId, products.id))
    .leftJoin(customers, eq(tradeIns.customerId, customers.id))
    .orderBy(desc(tradeIns.createdAt))
    .limit(100);

  const statusCounts = {
    submitted: submissions.filter(s => s.tradeIn.status === "submitted").length,
    under_review: submissions.filter(s => s.tradeIn.status === "under_review").length,
    offer_made: submissions.filter(s => s.tradeIn.status === "offer_made").length,
    accepted: submissions.filter(s => s.tradeIn.status === "accepted").length,
    completed: submissions.filter(s => s.tradeIn.status === "completed").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trade-In Management</h1>
        <p className="text-gray-600">Review and value trade-in submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <div className="text-xs text-orange-600 mb-1">Submitted</div>
          <div className="text-2xl font-bold text-orange-600">{statusCounts.submitted}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-xs text-blue-600 mb-1">Under Review</div>
          <div className="text-2xl font-bold text-blue-600">{statusCounts.under_review}</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-xs text-purple-600 mb-1">Offer Made</div>
          <div className="text-2xl font-bold text-purple-600">{statusCounts.offer_made}</div>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow p-4">
          <div className="text-xs text-indigo-600 mb-1">Accepted</div>
          <div className="text-2xl font-bold text-indigo-600">{statusCounts.accepted}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-xs text-green-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
        </div>
      </div>

      {/* Trade-Ins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">All Trade-In Submissions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offered Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map(({ tradeIn, product, customer }) => (
                <tr key={tradeIn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{tradeIn.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer?.name || tradeIn.customerName}</div>
                    <div className="text-sm text-gray-500">{customer?.email || tradeIn.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product?.title || "Unknown Product"}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{tradeIn.itemDescription}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tradeIn.condition === "excellent" ? "bg-green-100 text-green-800" :
                      tradeIn.condition === "very_good" ? "bg-blue-100 text-blue-800" :
                      tradeIn.condition === "good" ? "bg-yellow-100 text-yellow-800" :
                      "bg-orange-100 text-orange-800"
                    }`}>
                      {tradeIn.condition?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tradeIn.originalPrice ? `$${parseFloat(tradeIn.originalPrice).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tradeIn.offeredValue ? `$${parseFloat(tradeIn.offeredValue).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tradeIn.status === "submitted" ? "bg-orange-100 text-orange-800" :
                      tradeIn.status === "under_review" ? "bg-blue-100 text-blue-800" :
                      tradeIn.status === "offer_made" ? "bg-purple-100 text-purple-800" :
                      tradeIn.status === "accepted" ? "bg-indigo-100 text-indigo-800" :
                      tradeIn.status === "completed" ? "bg-green-100 text-green-800" :
                      tradeIn.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {tradeIn.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tradeIn.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/trade-ins/${tradeIn.id}`} className="text-blue-600 hover:text-blue-900">
                      Review
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
