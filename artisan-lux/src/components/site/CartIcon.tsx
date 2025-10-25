"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const [count, setCount] = useState<number>(0);

  async function refresh() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const n = Array.isArray(data.items)
        ? data.items.reduce((acc: number, it: { quantity: number }) => acc + (it.quantity || 0), 0)
        : 0;
      setCount(n);
    } catch {}
  }

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("cart:changed", handler as any);
    return () => window.removeEventListener("cart:changed", handler as any);
  }, []);

  return (
    <Link href="/cart" className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M2.25 2.25a.75.75 0 0 1 .75-.75h1.386a1.5 1.5 0 0 1 1.463 1.17l.149.67h13.252a.75.75 0 0 1 .736.905l-1.5 7.5a.75.75 0 0 1-.736.595H7.03l.176.792a1.5 1.5 0 0 0 1.463 1.17h9.831a.75.75 0 0 1 0 1.5H8.669a3 3 0 0 1-2.927-2.34L3.2 3.093a.75.75 0 0 0-.735-.593H3a.75.75 0 0 1-.75-.75ZM7.5 20.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#cd7f32] text-white text-xs px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
      <span className="hidden sm:block text-sm">Cart</span>
    </Link>
  );
}
