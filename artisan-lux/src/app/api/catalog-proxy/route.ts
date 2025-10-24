import { NextResponse } from "next/server";

export const revalidate = 0; // the route itself is dynamic; we cache the upstream fetch

export async function GET(req: Request) {
  // Prefer env; fall back to known admin deployment to avoid empty data in production
  const envOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || process.env.ADMIN_BASE_URL;
  const origin = envOrigin && /^https?:\/\//.test(envOrigin)
    ? envOrigin
    : "https://artisan-lux-e-commerce-website.vercel.app";

  // Pass through any query string (e.g., filters)
  const url = new URL(req.url);
  const qs = url.search;

  // Safety timeout so navigation never hangs forever
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${origin}/api/catalog${qs}`, {
      // Data Cache with tag; admin will trigger on-demand revalidate
      next: { tags: ["catalog"], revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) return NextResponse.json({ taxonomy: [], items: [], categories: [] }, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    // On timeout/error, respond with empty but valid payload so UI still renders instantly
    return NextResponse.json({ taxonomy: [], items: [], categories: [] }, { status: 200 });
  } finally {
    clearTimeout(t);
  }
}
