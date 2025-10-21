import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const origin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "http://localhost:3001";

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${origin}/api/catalog/${encodeURIComponent(slug)}`, {
      next: { tags: ["product:" + slug, "catalog"], revalidate: 3600 },
      signal: controller.signal,
    });
    if (!res.ok) return NextResponse.json({ item: null }, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ item: null }, { status: 200 });
  } finally {
    clearTimeout(t);
  }
}
