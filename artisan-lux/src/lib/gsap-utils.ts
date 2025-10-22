import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };

// Predefined animation configs for luxury feel
export const luxuryAnimations = {
  fadeInUp: {
    opacity: 0,
    y: 60,
    duration: 1.2,
    ease: "power3.out",
  },
  fadeInScale: {
    opacity: 0,
    scale: 0.95,
    duration: 1,
    ease: "power2.out",
  },
  slideInLeft: {
    x: -100,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  },
  slideInRight: {
    x: 100,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  },
  revealText: {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.1,
  },
};

export const scrollTriggerDefaults = {
  start: "top 85%",
  end: "bottom 15%",
  toggleActions: "play none none reverse",
};
