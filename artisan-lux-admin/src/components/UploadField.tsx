"use client";
import React from "react";
import { Picture } from "@/components/Picture";

type Uploaded = {
  id: number;
  url: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
};

export function UploadField(props: {
  label: string;
  type: "image" | "video";
  onUploaded?: (asset: Uploaded) => void;
  onUploadedMany?: (assets: Uploaded[]) => void;
  defaultUrl?: string;
  className?: string;
  multiple?: boolean;
  mode?: "direct" | "api"; // direct to Cloudinary or via our API
}) {
  const { label, type, onUploaded, onUploadedMany, defaultUrl, className, multiple, mode = "direct" } = props;
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | undefined>(defaultUrl);
  const [total, setTotal] = React.useState(0);
  const [done, setDone] = React.useState(0);
  const [percent, setPercent] = React.useState(0);

  type Sign = { signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string };

  async function getSignature(): Promise<Sign> {
    const signRes = await fetch("/api/admin/cloudinary/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceType: type }) });
    if (!signRes.ok) {
      const j = await signRes.json().catch(() => ({}));
      throw new Error(j.error || signRes.statusText);
    }
    return signRes.json();
  }

  async function uploadViaApi(files: File[]): Promise<Uploaded[]> {
    const results: Uploaded[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      const j = await res.json();
      results.push(j.item as Uploaded);
    }
    return results;
  }

  async function maybeDownscaleImage(file: File): Promise<File> {
    if (type !== "image") return file;
    // Only downscale very large images to speed up upload (max dimension 1600px)
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = url;
      });
      const maxDim = 1600;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale >= 1) return file;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
      if (!blob) return file;
      const f = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
      return f;
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function directUploadOne(file: File, sign: Sign, onProgress?: (p: number) => void): Promise<Uploaded> {
    const { signature, timestamp, apiKey, cloudName, folder } = sign;
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
    const prepared = await maybeDownscaleImage(file);
    const fd = new FormData();
    fd.append("file", prepared);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);

    // Use XHR to get upload progress events
    const cloud: any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        try {
          const ok = xhr.status >= 200 && xhr.status < 300;
          const body = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          if (!ok) return reject(new Error(body?.error?.message || body?.error || xhr.statusText));
          resolve(body);
        } catch (err) { reject(err instanceof Error ? err : new Error("Upload failed")); }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(fd);
    });
    const metaRes = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      type,
      url: cloud.secure_url,
      width: cloud.width ?? undefined,
      height: cloud.height ?? undefined,
      filesize: cloud.bytes ?? undefined,
      format: cloud.format ?? undefined,
    }) });
    if (!metaRes.ok) {
      const j = await metaRes.json().catch(() => ({}));
      throw new Error(j.error || metaRes.statusText);
    }
    const j = await metaRes.json();
    return j.item as Uploaded;
  }

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    setTotal(files.length);
    setDone(0);
    setPercent(0);
    try {
      if (mode === "direct") {
        let sign: Sign | null = null;
        try {
          sign = await getSignature();
        } catch (err) {
          // Cloudinary not configured; fallback to API uploads
          const assets = await uploadViaApi(files);
          if (assets[0]) setPreview(assets[0].url);
          if (assets.length > 1 && onUploadedMany) onUploadedMany(assets);
          else if (assets[0] && onUploaded) onUploaded(assets[0]);
          return;
        }
        const cores = (navigator as any).hardwareConcurrency || 4;
        const limit = Math.min(6, Math.max(2, Math.ceil(cores / 2))); // adapt to device
        const results: Uploaded[] = new Array(files.length);
        let index = 0;
        await Promise.all(
          Array.from({ length: Math.min(limit, files.length) }).map(async () => {
            while (true) {
              const i = index++;
              if (i >= files.length) break;
              const f = files[i];
              const asset = await directUploadOne(f, sign!, (p)=> setPercent(p));
              results[i] = asset;
              setDone((d)=>d+1);
            }
          })
        );
        const compact = results.filter(Boolean);
        if (compact[0]) setPreview(compact[0].url);
        if (compact.length > 1 && onUploadedMany) onUploadedMany(compact as Uploaded[]);
        else if (compact[0] && onUploaded) onUploaded(compact[0] as Uploaded);
      } else {
        // Fallback via our API (supports multiple)
        const assets = await uploadViaApi(files);
        if (assets[0]) setPreview(assets[0].url);
        if (assets.length > 1 && onUploadedMany) onUploadedMany(assets);
        else if (assets[0] && onUploaded) onUploaded(assets[0]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <label className="grid gap-1">
        <span className="text-sm">{label}</span>
        <input
          type="file"
          accept={type === "image" ? "image/*" : "video/*"}
          multiple={!!multiple}
          onChange={onChange}
          disabled={uploading}
          className="input"
        />
      </label>
      {uploading ? (
        <p className="text-xs text-[var(--color-muted)] mt-1">Uploading {done}/{total} {!multiple ? `${percent}%` : ""}</p>
      ) : null}
      {error ? <p className="text-xs text-red-500 mt-1">{error}</p> : null}
      {preview && type === "image" ? (
        <Picture src={preview} alt="preview" className="mt-2 max-h-40 rounded border border-[var(--color-border)]" />
      ) : null}
      {preview && type === "video" ? (
        <video src={preview} className="mt-2 max-h-48 rounded border border-[var(--color-border)]" controls />
      ) : null}
    </div>
  );
}
