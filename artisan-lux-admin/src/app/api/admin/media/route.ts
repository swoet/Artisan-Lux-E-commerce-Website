import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";

const MediaSchema = z.object({
  type: z.enum(["image", "video", "model3d"]).default("image"),
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  filesize: z.number().int().nonnegative().optional(),
  format: z.string().max(16).optional(),
  altText: z.string().optional(),
  dominantColor: z.string().max(16).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = MediaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;
  const rows = await db.insert(mediaAssets).values({
    type: data.type,
    url: data.url,
    width: data.width,
    height: data.height,
    filesize: data.filesize,
    format: data.format,
    altText: data.altText,
    dominantColor: data.dominantColor,
  }).returning();
  return NextResponse.json({ ok: true, item: rows[0] }, { status: 201 });
}
