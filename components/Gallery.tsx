"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";

type Photo = {
  src: string;
  w: number;
  h: number;
};

const photos: Photo[] = [
  { src: "/images/gallery/gallery-01.jpg", w: 1600, h: 900 },
  { src: "/images/gallery/gallery-02.jpg", w: 900, h: 1600 },
  { src: "/images/gallery/gallery-03.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-04.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-05.jpg", w: 944, h: 1600 },
  { src: "/images/gallery/gallery-06.jpg", w: 1600, h: 1200 },
  { src: "/images/gallery/gallery-07.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-08.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-09.jpg", w: 1600, h: 1200 },
  { src: "/images/gallery/gallery-10.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-11.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-12.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-13.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-14.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-15.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-16.jpg", w: 1200, h: 1600 },
];

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => {
    setOpen((i) => (i === null ? null : (i + photos.length - 1) % photos.length));
  }, []);
  const next = useCallback(() => {
    setOpen((i) => (i === null ? null : (i + 1) % photos.length));
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  return (
    <section id="gallery" className="mx-auto max-w-7xl border-t border-white/10 px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Gallery
        </p>
        <h2 className="mt-3 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
          In Use
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Photos of our cabinets at customers&apos; homes and offices.
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View photo ${i + 1} of ${photos.length}`}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Image
                src={p.src}
                alt={`OneByte cabinet at a customer's home — photo ${i + 1}`}
                width={p.w}
                height={p.h}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-zinc-950/70 p-3 backdrop-blur">
                  <svg
                    className="h-5 w-5 text-white"
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
              </div>
            </button>
          ))}
        </div>
      </Reveal>

      {open !== null && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors duration-300 hover:bg-white/20 active:scale-95"
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

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors duration-300 hover:bg-white/20 active:scale-95 sm:left-4"
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

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors duration-300 hover:bg-white/20 active:scale-95 sm:right-4"
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

          <div
            className="animate-zoom-in relative overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[open].src}
              alt={`OneByte cabinet at a customer's home — photo ${open + 1}`}
              width={photos[open].w}
              height={photos[open].h}
              className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
            />
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur">
            {open + 1} / {photos.length}
          </p>
        </div>
      )}
    </section>
  );
}
