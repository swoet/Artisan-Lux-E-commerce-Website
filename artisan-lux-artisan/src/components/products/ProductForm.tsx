"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Artisan {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormProps {
  artisan: Artisan;
  categories: Category[];
  product?: any;
}

export default function ProductForm({ artisan, categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Product fields
  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [stock, setStock] = useState(product?.stock || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [status, setStatus] = useState(product?.status || "draft");

  // Provenance Passport fields
  const [createPassport, setCreatePassport] = useState<boolean>(!!product?.passport || true);
  const [materialsOrigin, setMaterialsOrigin] = useState(product?.passport?.materialsOrigin || "");
  const [materialsDescription, setMaterialsDescription] = useState(product?.passport?.materialsDescription || "");
  const [productionTime, setProductionTime] = useState(product?.passport?.productionTime || "");
  const [artisanNotes, setArtisanNotes] = useState(product?.passport?.artisanNotes || "");
  const [careInstructions, setCareInstructions] = useState(product?.passport?.careInstructions || "");
  const [carbonFootprint, setCarbonFootprint] = useState(product?.passport?.carbonFootprint || "");
  const [certifications, setCertifications] = useState<string[]>(product?.passport?.certifications || []);
  const [warrantyYears, setWarrantyYears] = useState(product?.passport?.warrantyYears || "1");
  const [resaleEligible, setResaleEligible] = useState(product?.passport?.resaleEligible ?? true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/products/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const productData = {
        title,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        stock: parseInt(stock),
        images,
        status,
        artisanId: artisan.id,
        passport: createPassport ? {
          materialsOrigin,
          materialsDescription,
          productionTime: parseInt(productionTime),
          artisanNotes,
          careInstructions,
          carbonFootprint: carbonFootprint ? parseFloat(carbonFootprint) : null,
          certifications,
          warrantyYears: parseInt(warrantyYears),
          resaleEligible,
        } : null,
      };

      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-serif font-bold mb-6">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Handcrafted Ceramic Vase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="input"
              placeholder="Describe your product in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="input"
                placeholder="99.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="input"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="input"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="draft">Draft (not visible to customers)</option>
              <option value="active">Active (visible to customers)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="card">
        <h2 className="text-xl font-serif font-bold mb-6">Product Images</h2>

        <div className="space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="btn btn-secondary cursor-pointer">
              {uploadingImages ? "Uploading..." : "+ Add Images"}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
            </label>
            <p className="text-sm text-neutral-600 mt-2">
              Upload high-quality images of your product
            </p>
          </div>
        </div>
      </div>

      {/* Provenance Passport */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold">Provenance Passport</h2>
            <p className="text-sm text-neutral-600">
              Tell the story behind your product
            </p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={createPassport}
              onChange={(e) => setCreatePassport(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Create Passport</span>
          </label>
        </div>

        {createPassport && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Materials Origin
                </label>
                <input
                  type="text"
                  value={materialsOrigin}
                  onChange={(e) => setMaterialsOrigin(e.target.value)}
                  className="input"
                  placeholder="e.g., Local clay from Zimbabwe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Production Time (hours)
                </label>
                <input
                  type="number"
                  value={productionTime}
                  onChange={(e) => setProductionTime(e.target.value)}
                  className="input"
                  placeholder="8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Materials Description
              </label>
              <textarea
                value={materialsDescription}
                onChange={(e) => setMaterialsDescription(e.target.value)}
                rows={3}
                className="input"
                placeholder="Describe the materials used..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Artisan Notes
              </label>
              <textarea
                value={artisanNotes}
                onChange={(e) => setArtisanNotes(e.target.value)}
                rows={4}
                className="input"
                placeholder="Share your inspiration, techniques, or story..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Care Instructions
              </label>
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                rows={3}
                className="input"
                placeholder="How should customers care for this product?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Carbon Footprint (kg CO₂)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={carbonFootprint}
                  onChange={(e) => setCarbonFootprint(e.target.value)}
                  className="input"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Warranty (years)
                </label>
                <input
                  type="number"
                  value={warrantyYears}
                  onChange={(e) => setWarrantyYears(e.target.value)}
                  className="input"
                  placeholder="1"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={resaleEligible}
                    onChange={(e) => setResaleEligible(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Resale Eligible</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || uploadingImages}
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
