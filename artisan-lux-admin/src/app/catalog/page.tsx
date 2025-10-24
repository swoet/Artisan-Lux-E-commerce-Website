"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UploadField } from "@/components/UploadField";
import { Picture } from "@/components/Picture";
import { TAXONOMY } from "@/lib/taxonomy";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  descriptionRich?: string | null;
  parentCategoryId: number | null;
  order: number;
  status: "draft" | "published";
  priceDecimal?: number | null;
  currency?: string;
  coverImageId?: number | null;
  videoAssetId?: number | null;
  isFeatured?: boolean;
  materials?: string[];
  tags?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  taxonomyKey?: string | null;
};

export default function CatalogPage() {
  // Lists
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Category/Product form state
  const [rootKey, setRootKey] = useState<string>(TAXONOMY[0]?.key ?? "");
  const [childKey, setChildKey] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catDescriptionRich, setCatDescriptionRich] = useState("");
  const [priceDecimal, setPriceDecimal] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  const [videoAssetId, setVideoAssetId] = useState<number | null>(null);
  const [galleryIds, setGalleryIds] = useState<number[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [materials, setMaterials] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [minPriceStr, setMinPriceStr] = useState<string>("");
  const [maxPriceStr, setMaxPriceStr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const cRes = await fetch("/api/admin/categories", { cache: "no-store" });
        if (!cRes.ok) throw new Error("Failed to load catalog");
        const cData = await cRes.json();
        setCategories(cData.items ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Create Category/Product
  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const root = TAXONOMY.find((t) => t.key === rootKey);
    const child = root?.children?.find((c) => c.key === childKey);
    const finalNameDefault = child?.name || root?.name || "";
    const finalKey = child?.key || root?.key || "";
    const finalName = title && title.trim().length > 0 ? title : finalNameDefault;
    
    const payload: any = {
      taxonomyKey: finalKey,
      name: finalName,
      slug: catSlug || undefined,
      description: catDescription,
      descriptionRich: catDescriptionRich,
      status: "published",
    };
    
    // Add product-like fields if they have values
    if (priceDecimal !== null && priceDecimal > 0) {
      payload.priceDecimal = priceDecimal;
      payload.currency = currency;
    }
    if (coverImageId) payload.coverImageId = coverImageId;
    if (videoAssetId) payload.videoAssetId = videoAssetId;
    if (galleryIds.length) payload.galleryIds = galleryIds;
    if (isFeatured) payload.isFeatured = isFeatured;
    if (materials.trim()) payload.materials = materials.split(",").map(m => m.trim()).filter(Boolean);
    if (tags.trim()) payload.tags = tags.split(",").map(t => t.trim()).filter(Boolean);
    
    // Price range fields
    if (minPriceStr !== "") payload.minPrice = Number(minPriceStr);
    if (maxPriceStr !== "") payload.maxPrice = Number(maxPriceStr);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("Create failed: " + (j.error || res.statusText));
      return;
    }
    
    // Reset form
    setTitle("");
    setCatSlug(""); 
    setCatDescription(""); 
    setCatDescriptionRich("");
    setPriceDecimal(null);
    setCurrency("USD");
    setCoverImageId(null);
    setVideoAssetId(null);
    setGalleryIds([]);
    setGalleryPreviews([]);
    setIsFeatured(false);
    setMaterials("");
    setTags("");
    setMinPriceStr(""); 
    setMaxPriceStr("");
    
    // Reload list
    const list = await fetch("/api/admin/categories", { cache: "no-store" });
    const j = await list.json();
    setCategories(j.items ?? []);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Catalog</h1>
        <Link className="text-neutral-300 hover:text-white underline-offset-4 hover:underline" href="/">Back to Dashboard</Link>
      </div>

      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Create Item</h2>
        <form onSubmit={createItem} className="grid gap-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Category</span>
              <select className="select" value={rootKey} onChange={(e)=>{setRootKey(e.target.value); setChildKey("");}}>
                {TAXONOMY.map((t)=> (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Subcategory</span>
              <select className="select" value={childKey} onChange={(e)=>setChildKey(e.target.value)}>
                <option value="" >(none)</option>
                {TAXONOMY.find(t=>t.key===rootKey)?.children?.map(c => (
                  <option key={c.key} value={c.key}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>
          
          <label className="grid gap-1">
            <span className="text-sm">Title</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Men's Leather Jacket" />
          </label>
          
          <label className="grid gap-1">
            <span className="text-sm">Slug (optional)</span>
            <input className="input" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="auto from name if blank" />
          </label>
          
          <label className="grid gap-1">
            <span className="text-sm">Description (optional)</span>
            <textarea className="textarea" value={catDescription} onChange={(e) => setCatDescription(e.target.value)} />
          </label>
          
          <label className="grid gap-1">
            <span className="text-sm">Rich Description (optional)</span>
            <textarea className="textarea" rows={3} value={catDescriptionRich} onChange={(e) => setCatDescriptionRich(e.target.value)} placeholder="HTML or rich text description" />
          </label>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Product Details (optional - for sellable items)</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Price</span>
                <input type="number" step="0.01" className="input" value={priceDecimal || ""} onChange={(e) => setPriceDecimal(e.target.value ? parseFloat(e.target.value) : null)} />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Currency</span>
                <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
              </label>
            </div>
            
            <label className="grid gap-1">
              <span className="text-sm">Materials (comma-separated)</span>
              <input className="input" value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="e.g. Leather, Cotton, Silk" />
            </label>
            
            <label className="grid gap-1">
              <span className="text-sm">Tags (comma-separated)</span>
              <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. luxury, handmade, premium" />
            </label>
            
            <label className="grid gap-1">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span className="text-sm">Featured Item</span>
            </label>

            <UploadField label="Cover Image" type="image" onUploaded={(asset) => setCoverImageId(asset.id)} />
            <UploadField label="Product Video" type="video" onUploaded={(asset) => setVideoAssetId(asset.id)} />
            <UploadField label="Gallery Images" type="image" multiple onUploadedMany={(assets)=>{ setGalleryIds(prev=>[...prev, ...assets.map(a=>a.id)]); setGalleryPreviews(prev=>[...prev, ...assets.map(a=>a.url)]); }} />
            {galleryPreviews.length ? (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {galleryPreviews.map((url, i) => (
                  <Picture key={i} src={url} alt="gallery" className="h-20 w-full object-cover rounded border border-[var(--color-border)]" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Price Range (for category grouping)</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Min Price</span>
                <input type="number" step="0.01" className="input" value={minPriceStr} onChange={(e)=>setMinPriceStr(e.target.value)} />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Max Price</span>
                <input type="number" step="0.01" className="input" value={maxPriceStr} onChange={(e)=>setMaxPriceStr(e.target.value)} />
              </label>
            </div>
          </div>

          <button type="submit" className="btn w-fit">Create</button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-3">All Items</h2>
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : categories.length === 0 ? (
          <p className="text-neutral-400">No items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[800px] text-left">
              <thead>
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Slug</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Featured</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2">{c.id}</td>
                    <td className="p-2">{c.name}</td>
                    <td className="p-2 font-mono">{c.slug}</td>
                    <td className="p-2">
                      {c.priceDecimal ? `${Number(c.priceDecimal).toFixed(2)} ${c.currency || 'USD'}` : '—'}
                    </td>
                    <td className="p-2">
                      {c.isFeatured ? '⭐' : '—'}
                    </td>
                    <td className="p-2">{c.status}</td>
                    <td className="p-2">
                      <Link className="underline" href={`/categories/${c.id}`}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}