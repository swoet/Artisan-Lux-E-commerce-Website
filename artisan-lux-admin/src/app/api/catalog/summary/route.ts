import { NextResponse } from "next/server";
import { listCategories } from "@/db/queries/categories";
import { TAXONOMY } from "@/lib/taxonomy";

export const revalidate = 0;

function flattenTaxonomy() {
  const roots = TAXONOMY.map(r => ({ key: r.key, name: r.name, type: "root" as const }));
  const children = TAXONOMY.flatMap(r => (r.children ?? []).map(c => ({ key: c.key, name: c.name, type: "child" as const, parent: r.key })));
  return { roots, children };
}

export async function GET() {
  const { roots, children } = flattenTaxonomy();
  const cats = await listCategories();

  const byKey: Record<string, number> = {};
  for (const c of cats as any[]) {
    const k = c.taxonomyKey ?? "";
    if (!k) continue;
    byKey[k] = (byKey[k] ?? 0) + 1;
  }

  const summary = {
    roots: roots.map(r => ({ key: r.key, name: r.name, count: (byKey as any)[r.key] ?? 0 })),
    children: children.map(c => ({ key: c.key, name: c.name, parent: c.parent, count: (byKey as any)[c.key] ?? 0 })),
    unknownKeys: Object.keys(byKey).filter(k => !roots.some(r=>r.key===k) && !children.some(c=>c.key===k)).map(k => ({ key: k, count: (byKey as any)[k] })),
    totalCategories: cats.length,
  };

  return NextResponse.json({ taxonomy: TAXONOMY, summary });
}
