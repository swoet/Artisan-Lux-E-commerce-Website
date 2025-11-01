import { NextResponse } from "next/server";

export const revalidate = 0;

function fallbackTaxonomy() {
  return [
    { key: "fashion", name: "Fashion" },
    { key: "electronics", name: "Electronics" },
    { key: "home_living", name: "Home & Living" },
    { key: "art_collectibles", name: "Art & Collectibles" },
    { key: "beauty_grooming", name: "Beauty & Grooming" },
    { key: "outdoor_garden", name: "Outdoor & Garden" },
    { key: "toys_games", name: "Toys & Games" },
  ];
}

export async function GET() {
  const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || process.env.ADMIN_BASE_URL || "https://artisan-lux-e-commerce-website.vercel.app";
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${adminOrigin}/api/catalog/taxonomy`, { cache: "no-store", signal: controller.signal });
    if (!res.ok) return NextResponse.json({ taxonomy: fallbackTaxonomy() });
    const data = await res.json();
    return NextResponse.json({ taxonomy: data?.taxonomy ?? fallbackTaxonomy() });
  } catch {
    return NextResponse.json({ taxonomy: fallbackTaxonomy() });
  } finally {
    clearTimeout(t);
  }
}