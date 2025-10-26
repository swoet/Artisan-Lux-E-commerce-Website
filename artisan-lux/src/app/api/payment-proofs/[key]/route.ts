import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";

export const revalidate = 0;

export async function GET(
  _req: Request,
  context: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(context.params.key);
    const store = getStore("payment-proofs");
    const entry = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!entry || entry.data === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contentType = (entry.metadata as any)?.contentType || "application/octet-stream";

    return new NextResponse(entry.data as ArrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("Read proof error:", e);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
