"use client";

import { useRef } from "react";
import { useGSAP, gsap, luxuryAnimations, scrollTriggerDefaults } from "@/lib/gsap-utils";

export function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .from(titleRef.current, {
        ...luxuryAnimations.fadeInUp,
        delay: 0.3,
      })
      .from(
        subtitleRef.current,
        {
          ...luxuryAnimations.fadeInUp,
          delay: 0.1,
        },
        "-=0.8"
      )
      .from(
        ctaRef.current,
        {
          ...luxuryAnimations.fadeInScale,
        },
        "-=0.6"
      );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1
          ref={titleRef}
          className="font-serif text-5xl md:text-7xl font-bold text-neutral-900 mb-6"
        >
          Artisan Luxury
        </h1>
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-neutral-600 mb-8"
        >
          Curated excellence, crafted for the discerning
        </p>
        <div ref={ctaRef}>
          <a
            href="/categories"
            className="inline-block bg-neutral-900 text-white px-8 py-4 rounded-md hover:bg-neutral-800 transition-colors"
          >
            Explore Collection
          </a>
        </div>
      </div>
    </div>
  );
}
