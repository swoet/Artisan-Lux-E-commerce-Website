import { db } from "@/db";
import { conciergeConversations, customers, conciergeMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ConciergeAdminPage() {
  const conversations = await db
    .select({
      conversation: conciergeConversations,
      customer: customers,
    })
    .from(conciergeConversations)
    .leftJoin(customers, eq(conciergeConversations.customerId, customers.id))
    .orderBy(desc(conciergeConversations.updatedAt))
    .limit(100);

  const statusCounts = {
    open: conversations.filter(c => c.conversation.status === "open").length,
    in_progress: conversations.filter(c => c.conversation.status === "in_progress").length,
    resolved: conversations.filter(c => c.conversation.status === "resolved").length,
    closed: conversations.filter(c => c.conversation.status === "closed").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Concierge Conversations</h1>
        <p className="text-gray-600">Manage VIP customer conversations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="text-sm text-orange-600 mb-1">Open</div>
          <div className="text-3xl font-bold text-orange-600">{statusCounts.open}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="text-sm text-blue-600 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">{statusCounts.in_progress}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600 mb-1">Resolved</div>
          <div className="text-3xl font-bold text-green-600">{statusCounts.resolved}</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Closed</div>
          <div className="text-3xl font-bold text-gray-600">{statusCounts.closed}</div>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">All Conversations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conversations.map(({ conversation, customer }) => (
                <tr key={conversation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{conversation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer?.name || "Unknown"}</div>
                    <div className="text-sm text-gray-500">{customer?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{conversation.subject || "No subject"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      conversation.status === "open" ? "bg-orange-100 text-orange-800" :
                      conversation.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      conversation.status === "resolved" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {conversation.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      conversation.priority === "urgent" ? "bg-red-100 text-red-800" :
                      conversation.priority === "high" ? "bg-orange-100 text-orange-800" :
                      conversation.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {conversation.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conversation.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(conversation.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/concierge/${conversation.id}`} className="text-blue-600 hover:text-blue-900">
                      View Chat
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
