"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { lockLightbox } from "@/lib/lightbox";

export type Product = {
  name: string;
  price: string;
  dimensions: string;
  images: [string, string];
};

type DragSample = { x: number; t: number };

const CLOSE_MS = 250;

export default function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [suppress, setSuppress] = useState(true);
  const [transDur, setTransDur] = useState(600);
  const [step, setStep] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; dragX0: number; samples: DragSample[] } | null>(null);
  const indexRef = useRef(0);
  const movedRef = useRef(false);
  const openRef = useRef(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const openCarousel = useCallback((startIdx: number) => {
    setClosing(false);
    setIndex(startIdx);
    setDragX(0);
    setSuppress(true);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!openRef.current || closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  }, [closing]);

  const measure = useCallback(() => {
    const c = containerRef.current;
    const t = trackRef.current;
    if (!c || !t || t.children.length === 0) return;
    const slide = t.children[0] as HTMLElement;
    const nextStep =
      t.children.length > 1
        ? (t.children[1] as HTMLElement).offsetLeft - slide.offsetLeft
        : slide.offsetWidth;
    setStep(nextStep);
    setBaseOffset(Math.max(0, (c.clientWidth - slide.offsetWidth) / 2));
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      if (openRef.current) measure();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      measure();
      setSuppress(false);
    });
    return () => cancelAnimationFrame(id);
  }, [open, measure]);

  const goTo = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(product.images.length - 1, i)));
    setDragX(0);
    setTransDur(650);
  }, [product.images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goTo(indexRef.current - 1);
      if (e.key === "ArrowRight") goTo(indexRef.current + 1);
    };
    window.addEventListener("keydown", onKey);
    const prevClass = document.body.className;
    const prevOverflow = document.body.style.overflow;
    lockLightbox();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.className = prevClass;
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, goTo]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (closing) return;
    const c = containerRef.current;
    if (!c) return;
    try {
      c.setPointerCapture(e.pointerId);
    } catch {
      // ignore — capture not supported
    }
    dragRef.current = { x: e.clientX, dragX0: dragX, samples: [] };
    movedRef.current = false;
    setIsDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) movedRef.current = true;
    let next = d.dragX0 + dx;
    if (index === 0 && next > 0) next *= 0.35;
    else if (index === product.images.length - 1 && next < 0) next *= 0.35;
    setDragX(next);
    d.samples.push({ x: e.clientX, t: performance.now() });
    if (d.samples.length > 4) d.samples.shift();
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    setIsDragging(false);
    const n = d.samples.length;
    const v =
      n >= 2
        ? (d.samples[n - 1].x - d.samples[n - 2].x) / (d.samples[n - 1].t - d.samples[n - 2].t)
        : 0;
    let target = index;
    if (Math.abs(dragX) > step * 0.25) target = index + (dragX > 0 ? -1 : 1);
    else if (Math.abs(v) > 0.45) target = index + (v > 0 ? -1 : 1);
    target = Math.max(0, Math.min(product.images.length - 1, target));
    const dist = Math.abs(target - index);
    setTransDur(Math.min(850, Math.max(520, 520 + dist * 140)));
    setIndex(target);
    setDragX(0);
  };

  const onContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const c = containerRef.current;
    if (!c || movedRef.current) return;
    const rect = c.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const jump = Math.round(relX / step);
    if (jump !== 0) goTo(index + jump);
  };

  const translateX = baseOffset - index * step + dragX;

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border-2 border-beige-deep bg-beige-soft shadow-xl shadow-navy/20 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-navy/40 hover:shadow-2xl hover:shadow-navy/30">
        <p className="sr-only">{product.name}</p>
        <div className="grid grid-cols-2 gap-2 p-3">
          {product.images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => openCarousel(idx)}
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

      {open &&
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
            <div className="relative h-full w-full">
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

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index - 1);
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
                  goTo(index + 1);
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
                ref={containerRef}
                onClick={onContainerClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="relative h-full w-full overflow-hidden"
                style={{ touchAction: "pan-y" }}
              >
                <div
                  ref={trackRef}
                  className="flex h-full w-full cursor-grab select-none items-center gap-3 active:cursor-grabbing sm:gap-6"
                  style={{
                    transform: `translate3d(${translateX}px, 0, 0)`,
                    transition:
                      suppress || isDragging
                        ? "none"
                        : `transform ${transDur}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                    willChange: "transform",
                  }}
                >
                  {product.images.map((src, i) => (
                    <div
                      key={src}
                      className={`flex h-full w-[85%] flex-shrink-0 items-center justify-center transition-opacity duration-500 sm:w-[70%] lg:w-[60%] ${
                        i === index ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} — photo ${i + 1}`}
                        width={900}
                        height={1200}
                        sizes="90vw"
                        className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl shadow-black/60"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-navy/90 via-navy/40 to-transparent sm:w-24" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-navy/90 via-navy/40 to-transparent sm:w-24" />
              </div>

              <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                {index + 1} / {product.images.length}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}