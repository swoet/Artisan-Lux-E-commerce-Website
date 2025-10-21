"use client";

import { useState, FormEvent } from "react";

type InquiryModalProps = {
  productName: string;
  productSlug: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function InquiryModal({ productName, productSlug, isOpen, onClose }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productName,
          productSlug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setStatus("success");
      setTimeout(() => {
        onClose();
        setFormData({ name: "", email: "", message: "" });
        setStatus("idle");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] border border-[#cd7f32]/30 rounded-lg p-8 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-white">Inquire About {productName}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="text-green-400 text-lg mb-2">✓ Inquiry Sent Successfully</div>
            <p className="text-neutral-400 text-sm">We will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-neutral-300 mb-2">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-[#cd7f32] transition-colors"
                  disabled={status === "loading"}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-neutral-300 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-[#cd7f32] transition-colors"
                  disabled={status === "loading"}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-neutral-300 mb-2">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-[#cd7f32] transition-colors resize-none"
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <div className="text-red-400 text-sm">{errorMessage}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Send Inquiry"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-[#cd7f32] rounded-lg font-semibold hover:bg-[#cd7f32]/10 transition-colors"
                  disabled={status === "loading"}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
