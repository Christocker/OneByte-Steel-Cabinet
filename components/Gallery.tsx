"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startLeft: number } | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  const close = useCallback(() => setOpen(null), []);

  const nearestIndex = useCallback((el: HTMLElement) => {
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement;
      const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el || open === null) return;
      const clamped = Math.max(0, Math.min(photos.length - 1, i));
      (el.children[clamped] as HTMLElement | undefined)?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [open]
  );

  useEffect(() => {
    if (open === null) return;
    const id = requestAnimationFrame(() => {
      const el = trackRef.current;
      if (!el) return;
      (el.children[open] as HTMLElement | undefined)?.scrollIntoView({
        behavior: "auto",
        inline: "center",
        block: "nearest",
      });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, current, close, goTo]);

  const onScrollTrack = () => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = trackRef.current;
      if (!el || open === null) return;
      setCurrent(nearestIndex(el));
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { id: e.pointerId, startX: e.clientX, startLeft: el.scrollLeft };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // ignore — capture not supported
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = trackRef.current;
    if (!d || !el) return;
    el.scrollLeft = d.startLeft - (e.clientX - d.startX);
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    const el = trackRef.current;
    if (!el || open === null) return;
    const target = nearestIndex(el);
    (el.children[target] as HTMLElement | undefined)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

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
              onClick={() => {
                setCurrent(i);
                setOpen(i);
              }}
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
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <div className="relative h-full w-full">
            <button
              type="button"
              onClick={close}
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current - 1);
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current + 1);
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

            <div
              ref={trackRef}
              onScroll={onScrollTrack}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={(e) => e.stopPropagation()}
              className="no-scrollbar flex h-full w-full cursor-grab select-none items-center gap-3 overflow-x-auto px-3 active:cursor-grabbing sm:gap-6 sm:px-8"
              style={{ touchAction: "pan-y" }}
            >
              {photos.map((p, i) => (
                <div
                  key={p.src}
                  className={`flex h-full w-[85%] flex-shrink-0 snap-center items-center justify-center transition-all duration-500 ease-out sm:w-[70%] lg:w-[60%] ${
                    i === current ? "opacity-100 scale-100" : "opacity-50 scale-[0.9]"
                  }`}
                >
                  <Image
                    src={p.src}
                    alt={`OneByte cabinet at a customer's home — photo ${i + 1}`}
                    width={p.w}
                    height={p.h}
                    sizes="90vw"
                    className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl shadow-black/60"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-zinc-950/90 via-zinc-950/40 to-transparent sm:w-24" />

            <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur">
              {current + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
