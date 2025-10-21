"use client";
import React from "react";
import { Picture } from "@/components/site/Picture";

export default function ProductGallery({
  title,
  cover,
  gallery,
}: {
  title: string;
  cover?: string | null;
  gallery?: string[];
}) {
  const images = React.useMemo(() => {
    const arr = [cover, ...(gallery || [])].filter((u): u is string => !!u);
    // de-duplicate while preserving order
    const seen = new Set<string>();
    return arr.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
  }, [cover, gallery]);

  const [current, setCurrent] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const openLightbox = () => setOpen(true);
  const closeLightbox = () => setOpen(false);
  const prev = React.useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = React.useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <div>
      <button type="button" className="block w-full aspect-square rounded-lg border border-white/10 bg-white/5 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#cd7f32]" onClick={openLightbox} aria-label="Open image viewer">
        <Picture src={images[current]} alt={title} sizes="(min-width:768px) 50vw, 100vw" className="w-full h-full object-cover" fetchPriority="high" />
      </button>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((u, i) => (
            <button
              key={u}
              type="button"
              className={`relative h-20 w-full rounded border ${i === current ? "border-[#cd7f32]" : "border-white/10"}`}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Picture src={u} alt={title} sizes="120px" className="h-full w-full object-cover rounded" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={closeLightbox} aria-modal="true" role="dialog">
          <div className="relative max-w-5xl w-[92vw]" onClick={(e)=>e.stopPropagation()}>
            <Picture src={images[current]} alt={title} sizes="92vw" className="w-full h-auto max-h-[82vh] object-contain rounded" />
            <button type="button" className="absolute top-2 right-2 px-3 py-1 rounded bg-black/60 text-white border border-white/20" onClick={closeLightbox} aria-label="Close">Close</button>
            {images.length > 1 ? (
              <>
                <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded bg-black/60 text-white border border-white/20" onClick={prev} aria-label="Previous">‹</button>
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded bg-black/60 text-white border border-white/20" onClick={next} aria-label="Next">›</button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
