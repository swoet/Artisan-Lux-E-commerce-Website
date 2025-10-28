import { db } from "@/db";
import { customOrders, artisans, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function CustomOrdersAdminPage() {
  const orders = await db
    .select({
      order: customOrders,
      artisan: artisans,
      customer: customers,
    })
    .from(customOrders)
    .leftJoin(artisans, eq(customOrders.artisanId, artisans.id))
    .leftJoin(customers, eq(customOrders.customerId, customers.id))
    .orderBy(desc(customOrders.createdAt))
    .limit(100);

  const statusCounts = {
    draft: orders.filter(o => o.order.status === "draft").length,
    quoted: orders.filter(o => o.order.status === "quoted").length,
    approved: orders.filter(o => o.order.status === "approved").length,
    in_production: orders.filter(o => o.order.status === "in_production").length,
    completed: orders.filter(o => o.order.status === "completed").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Custom Orders</h1>
        <p className="text-gray-600">Monitor and manage custom order requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <div className="text-xs text-orange-600 mb-1">Draft</div>
          <div className="text-2xl font-bold text-orange-600">{statusCounts.draft}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-xs text-blue-600 mb-1">Quoted</div>
          <div className="text-2xl font-bold text-blue-600">{statusCounts.quoted}</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-xs text-purple-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-purple-600">{statusCounts.approved}</div>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow p-4">
          <div className="text-xs text-indigo-600 mb-1">In Production</div>
          <div className="text-2xl font-bold text-indigo-600">{statusCounts.in_production}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-xs text-green-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">All Custom Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artisan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(({ order, artisan, customer }) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{order.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer?.name || order.customerName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {artisan?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.budgetMin} - ${order.budgetMax}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "draft" ? "bg-orange-100 text-orange-800" :
                      order.status === "quoted" ? "bg-blue-100 text-blue-800" :
                      order.status === "approved" ? "bg-purple-100 text-purple-800" :
                      order.status === "in_production" ? "bg-indigo-100 text-indigo-800" :
                      order.status === "completed" ? "bg-green-100 text-green-800" :
                      order.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/custom-orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                      View Details
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
