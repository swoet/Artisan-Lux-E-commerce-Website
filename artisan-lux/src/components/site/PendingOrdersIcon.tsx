"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PendingOrdersIcon() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function fetchPendingCount() {
    try {
      const res = await fetch("/api/orders/pending-count", { cache: "no-store" });
      if (!res.ok) {
        setCount(0);
        return;
      }
      const data = await res.json();
      setCount(data.count || 0);
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || count === 0) return null;

  return (
    <Link 
      href="/orders/pending" 
      className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
      title={`${count} pending order${count > 1 ? 's' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-400">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
