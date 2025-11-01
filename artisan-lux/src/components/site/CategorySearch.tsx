"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

// Search within a single category: subcategories and items within that category

type Subcat = { slug: string; name: string };
type Item = { slug: string; title: string; imageUrl?: string | null };

export default function CategorySearch({ categorySlug, subcats, items }: { categorySlug: string; subcats: Subcat[]; items: Item[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { subs: [] as Subcat[], items: [] as Item[] };
    const subs = subcats.filter((s) => s.name.toLowerCase().includes(query)).slice(0, 8);
    const its = items.filter((i) => (i.title || "").toLowerCase().includes(query)).slice(0, 10);
    return { subs, items: its };
  }, [q, subcats, items]);

  const total = results.subs.length + results.items.length;

  return (
    <div className="max-w-3xl">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search within this category… (subcategories, items)"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#cd7f32] placeholder:text-neutral-400"
          aria-label="Search in category"
        />
        {open && q && (
          <div className="absolute left-0 right-0 mt-2 z-30 rounded-lg border border-white/10 bg-black/80 backdrop-blur p-2 shadow-xl">
            {total === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-400">No results</div>
            ) : (
              <div className="max-h-96 overflow-auto">
                {results.subs.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs uppercase tracking-wider text-neutral-400">Subcategories</div>
                    {results.subs.map((s) => (
                      <Link key={s.slug} href={`/category/${categorySlug}?sub=${encodeURIComponent(s.slug)}`} className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
                {results.items.length > 0 && (
                  <div className="mt-2">
                    <div className="px-3 py-1 text-xs uppercase tracking-wider text-neutral-400">Items</div>
                    {results.items.map((p) => (
                      <Link key={p.slug} href={`/product/${p.slug}`} className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
                        {p.title}
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
