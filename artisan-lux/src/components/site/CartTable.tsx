"use client";

import { useEffect, useState } from "react";

type CartItem = {
  productId: number;
  slug: string;
  title: string;
  quantity: number;
  unitPrice: string;
  currency: string;
};

type CartState = {
  items: CartItem[];
  totals: { totalCents: number; totalDecimal: string; currency: string } | null;
};

export default function CartTable() {
  const [state, setState] = useState<CartState>({ items: [], totals: null });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function load() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setState({ items: data.items || [], totals: data.totals || null });
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(productId: number, quantity: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setState({ items: data.items || [], totals: data.totals || null });
      try { window.dispatchEvent(new Event("cart:changed")); } catch {}
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(productId: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove");
      setState({ items: data.items || [], totals: data.totals || null });
      try { window.dispatchEvent(new Event("cart:changed")); } catch {}
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.orderId) throw new Error(data.error || "Checkout failed");
      window.location.href = `/payment/${data.orderId}`;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {state.items.length === 0 ? (
        <div className="text-neutral-300">Your cart is empty.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-neutral-300">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Subtotal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((it) => (
                <tr key={it.productId} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <a href={`/product/${it.slug}`} className="hover:text-[#cd7f32]">{it.title}</a>
                  </td>
                  <td className="px-4 py-3">{it.currency} {parseFloat(it.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <button disabled={loading} onClick={() => updateQty(it.productId, Math.max(0, it.quantity - 1))} className="px-2 py-1 border border-white/20 rounded">-</button>
                      <span>{it.quantity}</span>
                      <button disabled={loading} onClick={() => updateQty(it.productId, it.quantity + 1)} className="px-2 py-1 border border-white/20 rounded">+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{it.currency} {(parseFloat(it.unitPrice) * it.quantity).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button disabled={loading} onClick={() => removeItem(it.productId)} className="px-3 py-2 border border-white/20 rounded hover:bg-white/5">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-lg">
          Total: {state.totals ? `${state.totals.currency} ${state.totals.totalDecimal}` : "-"}
        </div>
        <div className="flex items-center gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="px-3 py-2 rounded bg-white/5 border border-white/10"
            type="email"
          />
          <button onClick={checkout} disabled={loading || state.items.length === 0 || !email}
            className="px-6 py-3 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            Checkout
          </button>
        </div>
      </div>

      {message && <div className="text-red-400 text-sm">{message}</div>}
    </div>
  );
}
