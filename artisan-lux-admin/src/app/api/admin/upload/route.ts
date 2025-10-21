import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { cloudinary } from "@/lib/cloudinary";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const maxDuration = 60;

const TypeSchema = z.enum(["image", "video", "model3d"]).default("image");

function guessMimeFromName(name: string | undefined, fallback: string) {
  if (!name) return fallback;
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp4")) return "video/mp4";
  return fallback;
}

async function uploadViaStream(buffer: Buffer, opts: { folder: string; resourceType: "image" | "video" | "auto" }) {
  return await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: opts.folder,
      resource_type: opts.resourceType as any,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    }, (err: any, res: any) => {
      if (err) return reject(err);
      resolve(res);
    });
    Readable.from(buffer).pipe(stream);
  });
}

async function uploadToCloudinary(file: File, type: "image" | "video" | "model3d") {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Some browsers may omit file.type; guess from filename as a fallback
  const mime = file.type || guessMimeFromName((file as any).name, type === "video" ? "video/mp4" : "image/jpeg");
  const folder = process.env.CLOUDINARY_FOLDER || "artisan-lux";
  // Use "auto" for images to let Cloudinary detect even if mime is generic
  const resourceType = type === "video" ? "video" : "auto";

  const useStream = buffer.byteLength > 5 * 1024 * 1024; // stream large files to avoid data URI bloat

  const uploadPromise = useStream
    ? uploadViaStream(buffer, { folder, resourceType })
    : cloudinary.uploader.upload(`data:${mime};base64,${buffer.toString("base64")}`, {
        folder,
        resource_type: resourceType as any,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        timeout: 60000,
      });

  // Guard against excessive duration (local dev safety)
  const withTimeout = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Upload timed out")), 55000));
  return await Promise.race([uploadPromise, withTimeout]);
}

async function saveLocalFallback(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try { await fs.mkdir(uploadsDir, { recursive: true }); } catch {}
  const base = ((file as any).name || `upload_${Date.now()}`).replace(/[^a-z0-9_.-]/gi, "_");
  const fname = `${Date.now()}_${base}`;
  const full = path.join(uploadsDir, fname);
  await fs.writeFile(full, buffer);
  return { secure_url: `/uploads/${fname}`, bytes: buffer.byteLength } as any;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const type = TypeSchema.parse((form.get("type") as string) ?? "image");
    const altText = (form.get("altText") as string) || undefined;
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file in form-data (field: 'file')" }, { status: 400 });
    }

    // Validate Cloudinary configuration early to provide a helpful message
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, UPLOAD_FALLBACK_LOCAL } = process.env as Record<string, string | undefined>;
    const haveCloudinary = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

    let uploaded: any;
    try {
      if (haveCloudinary) {
        uploaded = await uploadToCloudinary(file, type as any);
      } else if (UPLOAD_FALLBACK_LOCAL === "1") {
        uploaded = await saveLocalFallback(file);
      } else {
        return NextResponse.json({ error: "Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env, or set UPLOAD_FALLBACK_LOCAL=1 for local saves." }, { status: 400 });
      }
    } catch (err) {
      if (UPLOAD_FALLBACK_LOCAL === "1") {
        uploaded = await saveLocalFallback(file);
      } else {
        throw err;
      }
    }

    const rows = await db
      .insert(mediaAssets)
      .values({
        type: type,
        url: uploaded.secure_url,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        filesize: uploaded.bytes ?? null,
        format: uploaded.format ?? null,
        altText: altText,
        dominantColor: (uploaded as any).dominant_color ?? null,
      })
      .returning();
    return NextResponse.json({ ok: true, item: rows[0] }, { status: 201 });
  } catch (e) {
    let msg = "Upload failed";
    if (e && typeof e === "object") {
      // Extract Cloudinary error message when available
      const anyErr = e as any;
      msg = anyErr.message || anyErr.error?.message || anyErr.error?.error?.message || msg;
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
