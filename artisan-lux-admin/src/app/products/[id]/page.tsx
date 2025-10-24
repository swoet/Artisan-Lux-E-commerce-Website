"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UploadField } from "@/components/UploadField";
import { Picture } from "@/components/Picture";

type Product = {
  id: number;
  title: string;
  slug: string;
  priceDecimal: number;
  currency: string;
  categoryId: number | null;
  status: "draft" | "published";
  coverImageId?: number | null;
  videoAssetId?: number | null;
};

type Category = { id: number; name: string };

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [cats, setCats] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<Product["status"]>("draft");
  const [newCoverImageId, setNewCoverImageId] = useState<number | null>(null);
  const [newVideoAssetId, setNewVideoAssetId] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Invalid id");
      setLoading(false);
      return;
    }
    (async () => {
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`, { cache: "no-store" }),
        fetch(`/api/admin/categories`, { cache: "no-store" }),
      ]);
      if (!pRes.ok) {
        setError("Failed to load product");
        setLoading(false);
        return;
      }
      const p = await pRes.json();
      const c = await cRes.json();
      const prod = p.item as Product;
      setProduct(prod);
      setTitle(prod.title);
      setSlug(prod.slug);
      setPrice(prod.priceDecimal);
      setCurrency(prod.currency);
      setCategoryId(prod.categoryId ?? "");
      setStatus(prod.status);
      setCats(c.items ?? []);
      setLoading(false);
    })();
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          priceDecimal: price,
          currency,
          categoryId: categoryId === "" ? null : Number(categoryId),
          status,
          ...(newCoverImageId ? { coverImageId: newCoverImageId } : {}),
          ...(newVideoAssetId ? { videoAssetId: newVideoAssetId } : {}),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      setNewCoverImageId(null); setNewVideoAssetId(null);
      alert("Saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      alert(msg);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("Delete failed: " + (j.error || res.statusText));
      return;
    }
    router.push("/products");
  };

  if (loading) return <main className="p-8">Loading…</main>;
  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!product) return <main className="p-8">Not found</main>;

  return (
    <main className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Edit Product</h1>
        <Link className="text-[var(--color-muted)] hover:text-[var(--color-fg)] underline underline-offset-4" href="/products">Back</Link>
      </div>

      <form onSubmit={save} className="grid gap-3 max-w-xl">
        {product.coverImageId ? (
          <Picture src={`/api/image-proxy?id=${product.coverImageId}` as any} alt="Current cover" className="max-h-40 rounded border border-[var(--color-border)]" />
        ) : null}
        <label className="grid gap-1">
          <span className="text-sm">Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Slug</span>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Price</span>
            <input type="number" step="0.01" className="input" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Currency</span>
            <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm">Category</span>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">(none)</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Status</span>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as Product["status"]) }>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <UploadField label="Replace Cover Image" type="image" onUploaded={(asset) => setNewCoverImageId(asset.id)} />
        <UploadField label="Replace Product Video" type="video" onUploaded={(asset) => setNewVideoAssetId(asset.id)} />
        <div className="flex gap-3">
          <button type="submit" className="btn">Save</button>
          <button type="button" onClick={remove} className="btn btn-danger">Delete</button>
        </div>
      </form>
    </main>
  );
}
