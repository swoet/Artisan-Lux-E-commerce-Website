"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TradeInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [passportSerialNumber, setPassportSerialNumber] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [hasOriginalPackaging, setHasOriginalPackaging] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload image");

        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      setPhotos([...photos, ...uploadedUrls]);
    } catch (error) {
      alert("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/trade-in/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passportSerialNumber,
          itemDescription,
          condition,
          purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          hasOriginalPackaging,
          photos,
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit trade-in");
      }

      router.push(`/trade-in/success?id=${data.tradeInId}`);
    } catch (error: any) {
      alert(error.message || "Failed to submit trade-in");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-serif font-bold mb-6">Submit Trade-In Request</h2>

      <div className="space-y-6">
        {/* Passport Serial Number */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Provenance Passport Serial Number *
          </label>
          <input
            type="text"
            value={passportSerialNumber}
            onChange={(e) => setPassportSerialNumber(e.target.value)}
            required
            className="input"
            placeholder="AL-XXXXX-XXXX"
          />
          <p className="text-xs text-neutral-600 mt-1">
            Found on your product's provenance passport
          </p>
        </div>

        {/* Item Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Item Description *
          </label>
          <textarea
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
            rows={4}
            className="input"
            placeholder="Describe the item, including any notable features or details..."
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Condition *
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
            className="input"
          >
            <option value="">Select condition...</option>
            <option value="excellent">Excellent - Like new, no visible wear</option>
            <option value="very_good">Very Good - Minor wear, well maintained</option>
            <option value="good">Good - Normal wear, fully functional</option>
            <option value="fair">Fair - Noticeable wear, may need minor repairs</option>
          </select>
        </div>

        {/* Purchase Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Original Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="input"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Original Packaging */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasPackaging"
            checked={hasOriginalPackaging}
            onChange={(e) => setHasOriginalPackaging(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="hasPackaging" className="text-sm font-medium">
            I have the original packaging
          </label>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Photos * (at least 3 required)
          </label>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photos.map((url, index) => (
                <div key={index} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <Image src={url} alt={`Photo ${index + 1}`} fill className="object-cover" />
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

          <label className="btn btn-secondary cursor-pointer">
            {uploadingImages ? "Uploading..." : "+ Add Photos"}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImages}
              className="hidden"
            />
          </label>
          <p className="text-xs text-neutral-600 mt-2">
            Please include photos from multiple angles, showing any wear or damage
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

        {/* Submit */}
        <div className="pt-4 border-t border-neutral-200">
          <button
            type="submit"
            className="btn btn-primary w-full justify-center text-lg py-3"
            disabled={loading || uploadingImages || photos.length < 3}
          >
            {loading ? "Submitting..." : "Submit Trade-In Request"}
          </button>
          <p className="text-sm text-neutral-600 text-center mt-3">
            You'll receive a valuation offer within 2-3 business days
          </p>
        </div>
      </div>
    </form>
  );
}
