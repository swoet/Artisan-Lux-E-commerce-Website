import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.search;
  const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || process.env.ADMIN_BASE_URL || "https://artisan-lux-e-commerce-website.vercel.app";
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${adminOrigin}/api/catalog${qs}`, { cache: "no-store", signal: controller.signal });
    if (!res.ok) return NextResponse.json({ taxonomy: [], items: [], categories: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ taxonomy: [], items: [], categories: [] });
  } finally {
    clearTimeout(t);
  }
}