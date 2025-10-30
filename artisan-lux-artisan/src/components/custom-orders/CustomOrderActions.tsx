"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CustomOrder {
  id: number;
  status: string | null;
  quotedPrice: string | null;
  estimatedCompletionDate: Date | null;
}

interface CustomOrderActionsProps {
  order: CustomOrder;
  artisanId: number;
}

export default function CustomOrderActions({ order, artisanId }: CustomOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showProductionUpdate, setShowProductionUpdate] = useState(false);

  // Quote form state
  const [quotedPrice, setQuotedPrice] = useState(order.quotedPrice || "");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");

  // Production update state
  const [productionStage, setProductionStage] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + parseInt(estimatedDays));

      const res = await fetch(`/api/custom-orders/${order.id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPrice: parseFloat(quotedPrice),
          estimatedCompletionDate: estimatedDate.toISOString(),
          quoteNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit quote");

      router.refresh();
      setShowQuoteForm(false);
    } catch (error) {
      alert("Failed to submit quote");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Update order status to ${newStatus}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/custom-orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      router.refresh();
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleProductionUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/custom-orders/${order.id}/production-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: productionStage,
          notes: updateNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to send update");

      router.refresh();
      setShowProductionUpdate(false);
      setProductionStage("");
      setUpdateNotes("");
    } catch (error) {
      alert("Failed to send update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="font-bold mb-4">Actions</h3>

      {/* Pending - Submit Quote */}
      {order.status === "pending" && !showQuoteForm && (
        <button
          onClick={() => setShowQuoteForm(true)}
          className="btn btn-primary w-full justify-center mb-2"
        >
          Submit Quote
        </button>
      )}

      {/* Quote Form */}
      {showQuoteForm && (
        <form onSubmit={handleSubmitQuote} className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quoted Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              required
              className="input"
              placeholder="500.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estimated Days to Complete</label>
            <input
              type="number"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              required
              className="input"
              placeholder="14"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Additional details about the quote..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowQuoteForm(false)}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Quote"}
            </button>
          </div>
        </form>
      )}

      {/* Quoted - Waiting for customer */}
      {order.status === "quoted" && (
        <div className="text-sm text-blue-300 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          Waiting for customer to accept your quote
        </div>
      )}

      {/* Accepted - Start Production */}
      {order.status === "accepted" && (
        <button
          onClick={() => handleUpdateStatus("in_production")}
          className="btn btn-primary w-full justify-center mb-2"
          disabled={loading}
        >
          Start Production
        </button>
      )}

      {/* In Production - Send Updates & Complete */}
      {order.status === "in_production" && (
        <>
          {!showProductionUpdate && (
            <button
              onClick={() => setShowProductionUpdate(true)}
              className="btn btn-secondary w-full justify-center mb-2"
            >
              Send Production Update
            </button>
          )}

          {showProductionUpdate && (
            <form onSubmit={handleProductionUpdate} className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Production Stage</label>
                <select
                  value={productionStage}
                  onChange={(e) => setProductionStage(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Select stage...</option>
                  <option value="materials_sourced">Materials Sourced</option>
                  <option value="design_finalized">Design Finalized</option>
                  <option value="production_started">Production Started</option>
                  <option value="halfway_complete">50% Complete</option>
                  <option value="finishing_touches">Finishing Touches</option>
                  <option value="quality_check">Quality Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Update Notes</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  required
                  rows={3}
                  className="input"
                  placeholder="Share progress with the customer..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductionUpdate(false)}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Update"}
                </button>
              </div>
            </form>
          )}

          <button
            onClick={() => handleUpdateStatus("completed")}
            className="btn btn-primary w-full justify-center"
            disabled={loading}
          >
            Mark as Completed
          </button>
        </>
      )}

      {/* Completed - Mark as Delivered */}
      {order.status === "completed" && (
        <button
          onClick={() => handleUpdateStatus("delivered")}
          className="btn btn-primary w-full justify-center"
          disabled={loading}
        >
          Mark as Delivered
        </button>
      )}

      {/* Delivered - Done */}
      {order.status === "delivered" && (
        <div className="text-sm text-green-300 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
          ✓ Order delivered successfully
        </div>
      )}

      {/* Decline/Cancel */}
      {order.status && ["pending", "quoted"].includes(order.status) && (
        <button
          onClick={() => handleUpdateStatus("cancelled")}
          className="btn btn-secondary w-full justify-center mt-2 text-red-600"
          disabled={loading}
        >
          Decline Order
        </button>
      )}
    </div>
  );
}
