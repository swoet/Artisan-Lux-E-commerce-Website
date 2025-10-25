"use client";

import { useState } from "react";

export default function MarkPaidButton({ orderId, onDone }: { orderId: number; onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function markPaid() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark as paid");
      onDone?.();
      if (!onDone) window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as paid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={markPaid} disabled={loading} className="px-3 py-1.5 rounded bg-[var(--brand-to)] text-white hover:opacity-90 disabled:opacity-50">
        {loading ? "Updating..." : "Mark as Paid"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
