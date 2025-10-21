import { db } from "@/db";
import { mediaAssets, categoryMediaLinks } from "@/db/schema";
import { inArray, eq, asc } from "drizzle-orm";

export async function hydrateCoverImages(items: { coverImageId?: number | null }[]) {
  const ids = Array.from(new Set(items.map(i => i.coverImageId).filter((x): x is number => typeof x === "number")));
  if (!ids.length) return {} as Record<number, { id: number; url: string | null }>;
  const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.id, ids));
  return Object.fromEntries(media.map((m: any) => [m.id, m]));
}

export async function galleryForCategory(categoryId: number) {
  const links = await db.select().from(categoryMediaLinks).where(eq(categoryMediaLinks.categoryId, categoryId)).orderBy(asc(categoryMediaLinks.order));
  const ids = links.map((l: any) => l.mediaId);
  if (!ids.length) return [] as any[];
  const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.id, ids));
  const map = new Map<number, any>(media.map((m: any) => [m.id, m]));
  return links.map((l: any) => ({ ...map.get(l.mediaId), role: l.role, order: l.order })).filter(Boolean);
}

export async function galleriesForCategories(categoryIds: number[]) {
  if (!categoryIds.length) return {} as Record<number, any[]>;
  const links = await db.select().from(categoryMediaLinks)
    .where(inArray(categoryMediaLinks.categoryId, categoryIds))
    .orderBy(asc(categoryMediaLinks.categoryId), asc(categoryMediaLinks.order));
  const allMediaIds = Array.from(new Set((links as any[]).map(l => l.mediaId)));
  const media = allMediaIds.length ? await db.select().from(mediaAssets).where(inArray(mediaAssets.id, allMediaIds)) : [];
  const mediaMap = new Map<number, any>((media as any[]).map((m: any) => [m.id, m]));
  const out: Record<number, any[]> = {};
  for (const l of links as any[]) {
    const arr = out[l.categoryId] ?? (out[l.categoryId] = []);
    const m = mediaMap.get(l.mediaId);
    if (m) arr.push({ ...m, role: l.role, order: l.order });
  }
  return out;
}
