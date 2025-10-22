"use client";

import { useState, useEffect } from "react";

type WishlistButtonProps = {
  productId: number;
};

export function WishlistButton({ productId }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, [productId]);

  const checkWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();
      const exists = data.items?.some((item: { productId: number }) => item.productId === productId);
      setIsInWishlist(exists);
    } catch (error) {
      console.error("Check wishlist error:", error);
    }
  };

  const toggleWishlist = async () => {
    setLoading(true);
    try {
      if (isInWishlist) {
        // Find item and remove
        const response = await fetch("/api/wishlist");
        const data = await response.json();
        const item = data.items?.find((item: { id: number; productId: number }) => item.productId === productId);
        
        if (item) {
          await fetch(`/api/wishlist?itemId=${item.id}`, {
            method: "DELETE",
          });
          setIsInWishlist(false);
        }
      } else {
        // Add to wishlist
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Toggle wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-3 rounded-full transition-colors ${
        isInWishlist
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isInWishlist ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
