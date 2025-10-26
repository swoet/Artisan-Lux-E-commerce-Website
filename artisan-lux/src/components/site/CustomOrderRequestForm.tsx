"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Artisan {
  id: number;
  name: string;
  slug: string;
  specialties: string[] | null;
}

interface CustomOrderRequestFormProps {
  artisans: Artisan[];
}

export default function CustomOrderRequestForm({ artisans }: CustomOrderRequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [artisanId, setArtisanId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [materials, setMaterials] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
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

      setReferenceImages([...referenceImages, ...uploadedUrls]);
    } catch (error) {
      alert("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/custom-orders/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: parseInt(artisanId),
          title,
          description,
          budgetMin: parseFloat(budgetMin),
          budgetMax: parseFloat(budgetMax),
          desiredCompletionDate: desiredDate ? new Date(desiredDate).toISOString() : null,
          preferredMaterials: materials ? materials.split(",").map(m => m.trim()) : [],
          referenceImages,
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      // Redirect to success page or order tracking
      router.push(`/custom-order/success?id=${data.orderId}`);
    } catch (error: any) {
      alert(error.message || "Failed to submit request");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-serif font-bold mb-6">Your Custom Order Request</h2>

      <div className="space-y-6">
        {/* Contact Information */}
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
              Email Address *
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

        {/* Select Artisan */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Artisan *
          </label>
          <select
            value={artisanId}
            onChange={(e) => setArtisanId(e.target.value)}
            required
            className="input"
          >
            <option value="">Choose an artisan...</option>
            {artisans.map((artisan) => (
              <option key={artisan.id} value={artisan.id}>
                {artisan.name}
                {artisan.specialties && artisan.specialties.length > 0 && 
                  ` - ${artisan.specialties.join(", ")}`
                }
              </option>
            ))}
          </select>
          <p className="text-sm text-neutral-600 mt-1">
            Not sure? Browse <a href="/artisans" className="text-brand-dark-wood hover:underline">all artisans</a>
          </p>
        </div>

        {/* Project Title */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
            placeholder="e.g., Custom Wedding Ring Set"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Detailed Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            className="input"
            placeholder="Describe your vision in detail. Include size, style, colors, intended use, and any specific requirements..."
          />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Minimum Budget (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              required
              className="input"
              placeholder="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Maximum Budget (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              required
              className="input"
              placeholder="1000"
            />
          </div>
        </div>

        {/* Desired Completion Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Desired Completion Date (Optional)
          </label>
          <input
            type="date"
            value={desiredDate}
            onChange={(e) => setDesiredDate(e.target.value)}
            className="input"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Preferred Materials */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Preferred Materials (Optional)
          </label>
          <input
            type="text"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="input"
            placeholder="e.g., Gold, Silver, Leather (comma-separated)"
          />
        </div>

        {/* Reference Images */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Reference Images (Optional)
          </label>
          
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {referenceImages.map((url, index) => (
                <div key={index} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <Image src={url} alt={`Reference ${index + 1}`} fill className="object-cover" />
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
            {uploadingImages ? "Uploading..." : "+ Add Reference Images"}
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
            Upload images of similar pieces or inspiration
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-neutral-200">
          <button
            type="submit"
            className="btn btn-primary w-full justify-center text-lg py-3"
            disabled={loading || uploadingImages}
          >
            {loading ? "Submitting Request..." : "Submit Custom Order Request"}
          </button>
          <p className="text-sm text-neutral-600 text-center mt-3">
            The artisan will review your request and provide a quote within 2-3 business days
          </p>
        </div>
      </div>
    </form>
  );
}
