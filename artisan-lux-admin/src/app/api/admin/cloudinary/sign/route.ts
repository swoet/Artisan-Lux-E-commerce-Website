import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const resourceType = (body.resourceType as string) || "image"; // image | video | auto
  const folder = process.env.CLOUDINARY_FOLDER || "artisan-lux";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !cloudName) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 400 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  // Sign the parameters the client will send
  const paramsToSign: Record<string, string | number> = { timestamp, folder };
  const signature = (cloudinary as any).utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
  return NextResponse.json({ ok: true, signature, timestamp, apiKey, cloudName, folder, resourceType });
}
