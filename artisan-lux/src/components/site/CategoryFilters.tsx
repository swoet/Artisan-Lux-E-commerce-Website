"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  initialMin?: number;
  initialMax?: number;
  initialSort?: "price-asc" | "price-desc" | "newest" | undefined;
};

export default function CategoryFilters({ initialMin, initialMax, initialSort }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [min, setMin] = useState<string>(initialMin != null ? String(initialMin) : "");
  const [max, setMax] = useState<string>(initialMax != null ? String(initialMax) : "");
  const [sort, setSort] = useState<string>(initialSort ?? "");

  useEffect(() => {
    setMin(params.get("min") ?? (initialMin != null ? String(initialMin) : ""));
    setMax(params.get("max") ?? (initialMax != null ? String(initialMax) : ""));
    setSort(params.get("sort") ?? (initialSort ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams(params.toString());
    if (min) qs.set("min", min); else qs.delete("min");
    if (max) qs.set("max", max); else qs.delete("max");
    if (sort) qs.set("sort", sort); else qs.delete("sort");
    router.push(`?${qs.toString()}`);
  };

  const reset = () => {
    setMin(""); setMax(""); setSort("");
    const qs = new URLSearchParams(params.toString());
    qs.delete("min"); qs.delete("max"); qs.delete("sort");
    router.push(`?${qs.toString()}`);
  };

  return (
    <form onSubmit={apply} className="grid md:grid-cols-4 gap-3 items-end">
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Min price</span>
        <input type="number" step="0.01" value={min} onChange={(e)=>setMin(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder:text-neutral-400" placeholder="0" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Max price</span>
        <input type="number" step="0.01" value={max} onChange={(e)=>setMax(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder:text-neutral-400" placeholder="1000" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Sort</span>
        <select value={sort} onChange={(e)=>setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white">
          <option value="">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded text-white">Apply</button>
        <button type="button" onClick={reset} className="px-4 py-2 border border-white/20 rounded text-white/90">Reset</button>
      </div>
    </form>
  );
}
