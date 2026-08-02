"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type Product = {
  name: string;
  price: string;
  dimensions: string;
  images: [string, string];
};

const CLOSE_MS = 250;

type NaturalSize = { w: number; h: number };

export default function ProductCard({ product }: { product: Product }) {
  const [openImage, setOpenImage] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [naturalSize, setNaturalSize] = useState<NaturalSize | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  const open = useCallback((idx: number) => {
    setClosing(false);
    setNaturalSize(null);
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    setOpenImage(idx);
  }, []);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setOpenImage(null);
      setClosing(false);
    }, CLOSE_MS);
  }, [closing]);

  const move = useCallback(
    (dir: 1 | -1) => {
      if (openImage === null) return;
      const next = Math.max(0, Math.min(product.images.length - 1, openImage + dir));
      if (next !== openImage) open(next);
    },
    [openImage, product.images.length, open]
  );

  useEffect(() => {
    if (openImage === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prevOverflow;
    };
  }, [openImage, close, move]);

  const displaySize = useMemo(() => {
    if (!naturalSize || viewport.w === 0) return null;
    const maxW = Math.min(viewport.w * 0.92, 1100);
    const maxH = Math.min(viewport.h * 0.8, 900);
    const scale = Math.min(maxW / naturalSize.w, maxH / naturalSize.h);
    return {
      w: Math.round(naturalSize.w * scale),
      h: Math.round(naturalSize.h * scale),
    };
  }, [naturalSize, viewport]);

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border-2 border-beige-deep bg-beige-soft shadow-xl shadow-navy/20 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-navy/40 hover:shadow-2xl hover:shadow-navy/30">
        <p className="sr-only">{product.name}</p>
        <div className="grid grid-cols-2 gap-2 p-3">
          {product.images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => open(idx)}
              aria-label={`View ${product.name} photo ${idx + 1} of ${product.images.length} in full size`}
              className="group/thumb relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              <Image
                src={src}
                alt={`${product.name} — photo ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-navy/30 opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <div className="px-5 pb-6 pt-2">
          <h3 className="text-lg font-bold text-navy">{product.name}</h3>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <p className="text-2xl font-extrabold text-navy-light">₱{product.price}</p>
            <p className="text-xs uppercase tracking-wider text-navy/50">H × W × D</p>
          </div>
          <p className="mt-1 text-sm font-medium text-navy/70">{product.dimensions}</p>
        </div>
      </article>

      {openImage !== null &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-navy/95 backdrop-blur-sm ${
              closing ? "animate-fade-out" : "animate-fade-in"
            }`}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} photo viewer`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close photo viewer"
              className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-3 text-white transition-colors duration-300 hover:bg-white/20 active:scale-95"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {product.images[openImage - 1] && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors duration-300 hover:bg-white/20 active:scale-95 sm:left-4"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {product.images[openImage + 1] && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors duration-300 hover:bg-white/20 active:scale-95 sm:right-4"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}

            <div
              className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative"
                style={
                  displaySize
                    ? { width: displaySize.w, height: displaySize.h }
                    : { width: "min(92vw, 1100px)", height: "70vh" }
                }
              >
                <Image
                  src={product.images[openImage]}
                  alt={`${product.name} — photo ${openImage + 1}`}
                  fill
                  sizes="92vw"
                  className={`object-contain ${closing ? "" : "animate-zoom-in"}`}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                    }
                  }}
                />
              </div>
            </div>

            <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              {openImage + 1} / {product.images.length}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}