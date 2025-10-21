"use client";
import React from "react";

function isCloudinary(url: string) {
  return /res\.cloudinary\.com\//.test(url);
}

function withCldTransforms(url: string, transforms: string) {
  const i = url.indexOf("/upload/");
  if (i === -1) return url;
  const head = url.slice(0, i + "/upload/".length);
  const tail = url.slice(i + "/upload/".length);
  if (tail.startsWith(transforms + "/")) return url;
  return head + transforms + "/" + tail.replace(/^\//, "");
}

function srcSet(url: string, format: "avif" | "webp" | "jpg") {
  const widths = [320, 480, 640, 768, 960, 1200];
  const t = `f_${format},q_auto`;
  return widths
    .map((w) => `${withCldTransforms(withCldTransforms(url, t), `w_${w}`)} ${w}w`)
    .join(", ");
}

export function Picture({ src, alt, className, sizes = "100vw" }: { src?: string | null; alt: string; className?: string; sizes?: string; }) {
  if (!src) return null;
  const useCld = isCloudinary(src);
  if (!useCld) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
  }
  const avifSet = srcSet(src, "avif");
  const webpSet = srcSet(src, "webp");
  const jpgSet = srcSet(src, "jpg");
  const fallback = withCldTransforms(src, "f_jpg,q_auto,w_1200");
  return (
    <picture>
      <source type="image/avif" srcSet={avifSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fallback} srcSet={jpgSet} sizes={sizes} alt={alt} className={className} loading="lazy" decoding="async" />
    </picture>
  );
}
