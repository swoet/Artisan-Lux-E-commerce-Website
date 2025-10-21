import { revalidateTag } from "next/cache";

export const CacheTags = {
  home: "home",
  categories: "categories",
  category: (slug: string) => `category:${slug}`,
  product: (slug: string) => `product:${slug}`,
  featured: "featured",
  searchIndex: "search:index",
};

export function revalidateTags(tags: string[]) {
  for (const t of tags) revalidateTag(t);
}
