"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP, gsap, luxuryAnimations, scrollTriggerDefaults } from "@/lib/gsap-utils";

type AnimatedProductCardProps = {
  product: {
    id: number;
    slug: string;
    title: string;
    priceDecimal: string;
    currency: string;
    coverImageUrl?: string;
  };
  index?: number;
};

export function AnimatedProductCard({ product, index = 0 }: AnimatedProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      ...luxuryAnimations.fadeInUp,
      delay: index * 0.1,
      scrollTrigger: {
        trigger: cardRef.current,
        ...scrollTriggerDefaults,
      },
    });
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className="group">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-4">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              No image
            </div>
          )}
        </div>
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-2">
          {product.title}
        </h3>
        <p className="text-neutral-600">
          {product.currency} {parseFloat(product.priceDecimal).toFixed(2)}
        </p>
      </Link>
    </div>
  );
}
