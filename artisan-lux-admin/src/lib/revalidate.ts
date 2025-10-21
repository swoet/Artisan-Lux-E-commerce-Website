import { CacheTags } from "@/lib/cache-tags";

export async function revalidateSite({ tags = [], paths = [] }: { tags?: string[]; paths?: string[] }) {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";
  const token = process.env.REVALIDATE_TOKEN;
  if (!token) {
    console.warn("REVALIDATE_TOKEN is not set; skipping remote revalidation");
    return;
  }
  try {
    const res = await fetch(`${origin}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, tags, paths }),
      // Avoid hanging if site is unreachable
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Remote revalidate failed", { origin, status: res.status, body: text.slice(0, 200) });
    }
  } catch (e) {
    console.error("Remote revalidate error", (e as any)?.message ?? e);
  }
}

export function tagsForItem(slug: string) {
  return [
    "catalog",
    CacheTags.home,
    CacheTags.categories,
    CacheTags.category(slug),
    CacheTags.product(slug),
    CacheTags.featured,
    CacheTags.searchIndex,
  ];
}
