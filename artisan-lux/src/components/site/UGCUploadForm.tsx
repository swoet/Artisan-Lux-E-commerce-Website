"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UGCUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");

      const data = await res.json();
      setImageUrl(data.url);
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ugc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: imageUrl,
          caption,
          productId: productId ? parseInt(productId) : null,
          customerName,
          customerEmail,
          instagramHandle: instagramHandle || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      router.push("/gallery?submitted=true");
    } catch (error: any) {
      alert(error.message || "Failed to submit photo");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-serif font-bold mb-6">Upload Your Photo</h2>

      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Photo *
          </label>
          
          {imageUrl ? (
            <div className="relative w-full aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-4">
              <Image src={imageUrl} alt="Upload preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block w-full aspect-square border-2 border-dashed border-neutral-300 rounded-lg hover:border-brand-dark-wood transition-colors cursor-pointer">
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <div className="text-4xl mb-2">📸</div>
                <div className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Click to upload photo"}
                </div>
                <div className="text-xs mt-1">JPG, PNG up to 10MB</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                required={!imageUrl}
              />
            </label>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Caption *
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
            rows={3}
            className="input"
            placeholder="Tell us about your photo..."
          />
        </div>

        {/* Product ID (Optional) */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Product ID (Optional)
          </label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="input"
            placeholder="Tag a product from your order"
          />
          <p className="text-xs text-neutral-600 mt-1">
            Find product ID in your order confirmation email
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="input"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              className="input"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Instagram Handle */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Instagram Handle (Optional)
          </label>
          <input
            type="text"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            className="input"
            placeholder="@yourusername"
          />
          <p className="text-xs text-neutral-600 mt-1">
            We may feature your photo on our Instagram
          </p>
        </div>

        {/* Terms */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-xs text-neutral-600">
          <p>
            By submitting, you grant Artisan Lux permission to use your photo for marketing purposes.
            You'll receive 50 reward points once approved, and 100 bonus points if featured.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full justify-center text-lg py-3"
          disabled={loading || uploading || !imageUrl}
        >
          {loading ? "Submitting..." : "Submit Photo"}
        </button>
      </div>
    </form>
  );
}
