"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LiveCatalogRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  const last = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const res = await fetch("/api/catalog-version", { cache: "no-store" });
        const data = await res.json().catch(() => ({ version: "0" }));
        if (mounted && data.version && last.current && data.version !== last.current) {
          router.refresh();
        }
        last.current = data.version ?? last.current;
      } catch {}
      timer = setTimeout(tick, intervalMs);
    };
    tick();
    return () => { mounted = false; clearTimeout(timer); };
  }, [intervalMs, router]);

  return null;
}
