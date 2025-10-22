"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InquiryModal from "./InquiryModal";
import AuthModal from "./AuthModal";
import { isAuthenticated } from "@/lib/auth";

type ProductActionsProps = {
  productName: string;
  productSlug: string;
};

export default function ProductActions({ productName, productSlug }: ProductActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState<"none" | "cart" | "buy">("none");
  const [message, setMessage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  async function addToCart() {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoading("cart");
    setMessage("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      setMessage("Added to cart");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading("none");
      setTimeout(() => setMessage(""), 2500);
    }
  }

  async function buyNow() {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoading("buy");
    setMessage("");
    try {
      // Ensure item in cart
      const add = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, quantity: 1 }),
      });
      if (!add.ok) throw new Error("Failed to prepare cart");

      const checkout = await fetch("/api/checkout", { method: "POST" });
      const data = await checkout.json();
      if (!checkout.ok || !data.orderId) throw new Error(data.error || "Checkout failed");
      
      // Redirect to payment instructions page
      window.location.href = `/payment/${data.orderId}`;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
      setLoading("none");
    }
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={buyNow}
          disabled={loading !== "none"}
          className="px-6 py-3 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === "buy" ? "Processing..." : "Buy Now"}
        </button>
        <button
          onClick={addToCart}
          disabled={loading !== "none"}
          className="px-6 py-3 border border-[#cd7f32] rounded-lg font-semibold hover:bg-[#cd7f32]/10 transition-colors disabled:opacity-50"
        >
          {loading === "cart" ? "Adding..." : "Add to Cart"}
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors"
        >
          Inquire
        </button>
        <Link
          href="/categories"
          className="px-6 py-3 border border-[#cd7f32] rounded-lg font-semibold hover:bg-[#cd7f32]/10 transition-colors"
        >
          Back to Categories
        </Link>
      </div>

      {message && (
        <div className="mt-3 text-sm text-green-400">{message}</div>
      )}

      <InquiryModal
        productName={productName}
        productSlug={productSlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsLoggedIn(true);
          setMessage("Successfully logged in! You can now make your purchase.");
          setTimeout(() => setMessage(""), 3000);
        }}
      />
    </>
  );
}
