"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Lightweight, client-side global search across categories, subcategories and items
// Fetches data via our local proxy to avoid CORS

type TaxonomyNode = { key: string; name: string; children?: { key: string; name: string }[] };
type AdminItem = { id: number; name: string; slug: string; taxonomyKey?: string | null; coverImage?: { url: string | null } | null };

type CatalogPayload = { taxonomy: TaxonomyNode[]; items: AdminItem[] };

function slugFromKey(key: string) { return key.replace(/_/g, "-"); }

function useCatalog() {
  const [data, setData] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let didCancel = false;
    setLoading(true);
    fetch("/api/catalog-proxy", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (!didCancel) setData(j as CatalogPayload); })
      .catch((e) => { if (!didCancel) setError(e as Error); })
      .finally(() => { if (!didCancel) setLoading(false); });
    return () => { didCancel = true; };
  }, []);

  return { data, loading, error };
}

export default function SearchGlobal() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { data } = useCatalog();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query || !data) return { cats: [], subs: [], items: [] } as {
      cats: { name: string; href: string }[];
      subs: { name: string; href: string }[];
      items: { name: string; href: string }[];
    };

    const cats = (data.taxonomy || [])
      .filter((t) => t.name.toLowerCase().includes(query))
      .slice(0, 5)
      .map((t) => ({ name: t.name, href: `/category/${slugFromKey(t.key)}` }));

    const subs: { name: string; href: string }[] = [];
    for (const t of data.taxonomy || []) {
      const parentSlug = slugFromKey(t.key);
      for (const c of t.children || []) {
        if (c.name.toLowerCase().includes(query)) {
          subs.push({ name: `${c.name} · ${t.name}`, href: `/category/${parentSlug}?sub=${encodeURIComponent(slugFromKey(c.key))}` });
          if (subs.length >= 6) break;
        }
      }
      if (subs.length >= 6) break;
    }

    const items = (data.items || [])
      .filter((it) => (it.name || "").toLowerCase().includes(query))
      .slice(0, 8)
      .map((it) => ({ name: it.name, href: `/product/${it.slug}` }));

    return { cats, subs, items };
  }, [q, data]);

  const total = results.cats.length + results.subs.length + results.items.length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search items, categories, subcategories…"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#cd7f32] placeholder:text-neutral-400"
          aria-label="Search"
        />
        {open && q && (
          <div className="absolute left-0 right-0 mt-2 z-30 rounded-lg border border-white/10 bg-black/80 backdrop-blur p-2 shadow-xl">
            {total === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-400">No results</div>
            ) : (
              <div className="max-h-96 overflow-auto">
                {results.cats.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs uppercase tracking-wider text-neutral-400">Categories</div>
                    {results.cats.map((r) => (
                      <Link key={r.href} href={r.href} className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
                        {r.name}
                      </Link>
                    ))}
                  </div>
                )}
                {results.subs.length > 0 && (
                  <div className="mt-2">
                    <div className="px-3 py-1 text-xs uppercase tracking-wider text-neutral-400">Subcategories</div>
                    {results.subs.map((r) => (
                      <Link key={r.href} href={r.href} className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
                        {r.name}
                      </Link>
                    ))}
                  </div>
                )}
                {results.items.length > 0 && (
                  <div className="mt-2">
                    <div className="px-3 py-1 text-xs uppercase tracking-wider text-neutral-400">Items</div>
                    {results.items.map((r) => (
                      <Link key={r.href} href={r.href} className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
                        {r.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
