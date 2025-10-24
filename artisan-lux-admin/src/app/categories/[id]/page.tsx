"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TAXONOMY } from "@/lib/taxonomy";
import { UploadField } from "@/components/UploadField";
import { Picture } from "@/components/Picture";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentCategoryId: number | null;
  order: number;
  status: "draft" | "published";
  seoTitle?: string | null;
  seoDescription?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  taxonomyKey?: string | null;
};

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Category["status"]>("draft");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [rootKey, setRootKey] = useState<string>("");
  const [childKey, setChildKey] = useState<string>("");
  const [galleryIds, setGalleryIds] = useState<number[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Invalid id");
      setLoading(false);
      return;
    }
    (async () => {
      const res = await fetch(`/api/admin/categories/${id}`, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load category");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const c = data.item as Category;
      setCategory(c);
      // Load gallery for this item (independent of price)
      try {
        const galleryRes = await fetch(`/api/catalog/${encodeURIComponent(c.slug)}`, { cache: "no-store" });
        const gj = await galleryRes.json().catch(()=>({item:null}));
        const gal = (gj.item?.gallery||[]) as { url?: string | null }[];
        setGalleryPreviews(gal.filter(x=>!!x?.url).map(x=>x.url as string));
      } catch {}
      setName(c.name);
      setSlug(c.slug);
      setDescription(c.description || "");
      setStatus(c.status);
      setMinPrice(c.minPrice != null ? String(c.minPrice) : "");
      setMaxPrice(c.maxPrice != null ? String(c.maxPrice) : "");
      // try map taxonomyKey back to selection
      if (c.taxonomyKey) {
        const root = TAXONOMY.find(t => c.taxonomyKey?.startsWith(t.key));
        setRootKey(root?.key || "");
        const child = root?.children?.find(ch => ch.key === c.taxonomyKey);
        setChildKey(child?.key || "");
      }
      setLoading(false);
    })();
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const root = TAXONOMY.find(t => t.key === rootKey);
    const child = root?.children?.find(c => c.key === childKey);
    // Keep the name entered by the admin; only fall back to taxonomy labels if empty
    const finalName = name && name.trim().length > 0 ? name : (child?.name || root?.name || name);
    const finalKey = child?.key || root?.key || undefined;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxonomyKey: finalKey,
        name: finalName,
        slug,
        description,
        status,
        minPrice: minPrice === "" ? null : Number(minPrice),
        maxPrice: maxPrice === "" ? null : Number(maxPrice),
        addGalleryIds: galleryIds,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("Update failed: " + (j.error || res.statusText));
      return;
    }
    alert("Saved");
  };

  const remove = async () => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("Delete failed: " + (j.error || res.statusText));
      return;
    }
    router.push("/categories");
  };

  if (loading) return <main className="p-8">Loading…</main>;
  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!category) return <main className="p-8">Not found</main>;

  return (
    <main className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Edit Category</h1>
        <Link className="text-neutral-300 hover:text-white underline underline-offset-4" href="/categories">Back</Link>
      </div>

      <form onSubmit={save} className="grid gap-3 max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Slug</span>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Category</span>
            <select className="select" value={rootKey} onChange={(e)=>{setRootKey(e.target.value); setChildKey("");}}>
              <option value="">(unchanged)</option>
              {TAXONOMY.map((t)=> (
                <option key={t.key} value={t.key}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Subcategory</span>
            <select className="select" value={childKey} onChange={(e)=>setChildKey(e.target.value)}>
              <option value="">(none)</option>
              {TAXONOMY.find(t=>t.key===rootKey)?.children?.map(c => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm">Description</span>
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Min Price (optional)</span>
            <input type="number" step="0.01" className="input" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Max Price (optional)</span>
            <input type="number" step="0.01" className="input" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm">Status</span>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as Category["status"]) }>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Gallery</h3>
          <div className="mb-2">
            <UploadField label="Add Images" type="image" multiple onUploadedMany={(assets: { id: number; url: string }[])=>{ setGalleryIds(prev=>[...prev, ...assets.map((a)=>a.id)]); setGalleryPreviews(prev=>[...prev, ...assets.map((a)=>a.url)]); }} />
          </div>
          {galleryPreviews.length ? (
            <div className="grid grid-cols-4 gap-2">
              {galleryPreviews.map((url, i)=> (
                <Picture key={i} src={url} alt="gallery" className="h-20 w-full object-cover rounded border border-[var(--color-border)]" />
              ))}
            </div>
          ) : <p className="text-sm text-neutral-500">No gallery images yet.</p>}
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit" className="btn">Save</button>
          <button type="button" onClick={remove} className="btn btn-danger">Delete</button>
        </div>
      </form>
    </main>
  );
}
