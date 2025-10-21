import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { bumpVersion } from "@/lib/version";

export async function POST(req: Request) {
  try {
    const { token, tags = [], paths = [] } = await req.json();
    
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Revalidate tags
    for (const tag of tags) {
      revalidateTag(tag);
    }

    // Revalidate paths
    for (const path of paths) {
      revalidatePath(path);
    }

    // Bump a live version so open pages can auto-refresh via LiveCatalogRefresh
    bumpVersion("revalidate");

    return NextResponse.json({ ok: true, revalidated: { tags, paths } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
