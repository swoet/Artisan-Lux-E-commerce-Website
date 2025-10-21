import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }
  
  const assetId = Number(id);
  if (Number.isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
  }
  
  try {
    const assets = await db.select().from(mediaAssets).where(eq(mediaAssets.id, assetId)).limit(1);
    const asset = assets[0];
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    // Redirect to the actual asset URL (Cloudinary)
    return NextResponse.redirect(asset.url, 302);
  } catch (error) {
    console.error("Error fetching media asset:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}