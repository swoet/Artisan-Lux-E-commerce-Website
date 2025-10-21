"use client";

import { useState } from "react";

export default function PaymentProofUpload({ orderId }: { orderId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setStatus("error");
      setMessage("Please select a file");
      return;
    }

    setUploading(true);
    setStatus("idle");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("proof", file);
      formData.append("orderId", String(orderId));
      formData.append("paymentMethod", paymentMethod);

      const res = await fetch("/api/upload-payment-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setStatus("success");
      setMessage("Proof uploaded successfully! We will verify your payment shortly.");
      setFile(null);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-300 mb-2">Payment Method Used</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-[#cd7f32] transition-colors"
          disabled={uploading}
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="ecocash">EcoCash</option>
          <option value="onemoney">OneMoney</option>
          <option value="innbucks">InnBucks</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-300 mb-2">Upload Proof (Screenshot/Photo)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-[#cd7f32] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#cd7f32] file:text-white hover:file:bg-[#b87333] file:cursor-pointer"
          disabled={uploading}
        />
      </div>

      {status === "success" && (
        <div className="text-green-400 text-sm p-3 bg-green-600/20 border border-green-500 rounded">
          {message}
        </div>
      )}

      {status === "error" && (
        <div className="text-red-400 text-sm p-3 bg-red-600/20 border border-red-500 rounded">
          {message}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full px-6 py-3 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Submit Payment Proof"}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        Supported formats: JPG, PNG, PDF. Max size: 5MB
      </p>
    </div>
  );
}
