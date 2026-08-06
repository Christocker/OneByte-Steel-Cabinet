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
import type { InventoryProduct } from "@/lib/products";
import { formatPriceDisplay } from "@/lib/format";

type DragSample = { x: number; t: number };

const CLOSE_MS = 250;

export default function ProductCard({ product }: { product: InventoryProduct }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [suppress, setSuppress] = useState(true);
  const [transDur, setTransDur] = useState(600);
  const [step, setStep] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    dragX0: number;
    panX0: number;
    panY0: number;
    mode: "slide" | "zoom";
    samples: DragSample[];
  } | null>(null);
  const indexRef = useRef(0);
  const movedRef = useRef(false);
  const openRef = useRef(false);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = { x: panX, y: panY };
  }, [panX, panY]);

  const openCarousel = useCallback((startIdx: number) => {
    setClosing(false);
    setIndex(startIdx);
    setDragX(0);
    setSuppress(true);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!openRef.current || closing) return;
    setClosing(true);
    document.body.classList.remove("lightbox-open");
    document.body.style.overflow = "";
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

  const panBounds = useCallback(() => {
    const c = containerRef.current;
    const b = zoomBoxRef.current;
    if (!c || !b) return { x: 0, y: 0 };
    const cr = c.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return {
      x: Math.max(0, (br.width - cr.width) / 2),
      y: Math.max(0, (br.height - cr.height) / 2),
    };
  }, []);

  const clampPan = useCallback(
    (x: number, y: number) => {
      const b = panBounds();
      return {
        x: Math.max(-b.x, Math.min(b.x, x)),
        y: Math.max(-b.y, Math.min(b.y, y)),
      };
    },
    [panBounds]
  );

  const applyZoom = useCallback(
    (next: number) => {
      const clamped = Math.min(3, Math.max(1, next));
      setZoom(clamped);
      if (clamped === 1) {
        setPanX(0);
        setPanY(0);
      } else {
        const c = clampPan(panRef.current.x, panRef.current.y);
        setPanX(c.x);
        setPanY(c.y);
      }
    },
    [clampPan]
  );

  const toggleZoom = useCallback(() => {
    if (zoomRef.current > 1) applyZoom(1);
    else applyZoom(2.5);
  }, [applyZoom]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (closing) return;
    const c = containerRef.current;
    if (!c) return;
    try {
      c.setPointerCapture(e.pointerId);
    } catch {
      // ignore — capture not supported
    }
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      dragX0: dragX,
      panX0: panRef.current.x,
      panY0: panRef.current.y,
      mode: zoomRef.current > 1 ? "zoom" : "slide",
      samples: [],
    };
    movedRef.current = false;
    setIsDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.mode === "zoom") {
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
      const next = clampPan(d.panX0 + dx, d.panY0 + dy);
      setPanX(next.x);
      setPanY(next.y);
      return;
    }
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
    if (d.mode === "zoom") return;
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
    if (!c || movedRef.current || zoomRef.current > 1 || e.detail > 1) return;
    const rect = c.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const jump = Math.round(relX / step);
    if (jump !== 0) goTo(index + jump);
  };

  const onContainerDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    toggleZoom();
  };

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.25 : -0.25;
      applyZoom(zoomRef.current + factor);
    },
    [applyZoom]
  );

  useEffect(() => {
    const c = containerRef.current;
    if (!open || !c) return;
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [open, onWheel]);

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
            <p className="text-2xl font-extrabold text-navy-light">{formatPriceDisplay(product.price)}</p>
            <p className="text-xs uppercase tracking-wider text-navy/50">H × W × D</p>
           </div>
           <p className="mt-1 text-sm font-medium text-navy/70">{product.dimensions}</p>
           <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-beige-deep/70 pt-4">
             <p className="text-sm font-semibold text-navy">
               Stock: <span className="text-navy-light">{product.stock}</span>
             </p>
             <span
               className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                 product.stock > 0
                   ? "bg-emerald-100 text-emerald-800"
                   : "bg-red-100 text-red-800"
               }`}
             >
               <span
                 className={`h-2 w-2 rounded-full ${
                   product.stock > 0 ? "bg-emerald-600" : "bg-red-600"
                 }`}
               />
               {product.stock > 0 ? "In Stock" : "Out of Stock"}
             </span>
           </div>
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
                onDoubleClick={onContainerDoubleClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="relative h-full w-full overflow-hidden"
                style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
              >
                <div
                  ref={trackRef}
                  className={`flex h-full w-full select-none items-center gap-3 sm:gap-6 ${
                    zoom > 1 ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"
                  }`}
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
                      <div
                        ref={i === index ? zoomBoxRef : undefined}
                        className="transition-transform duration-300 ease-out will-change-transform"
                        style={{
                          transform: `translate3d(${i === index ? panX : 0}px, ${
                            i === index ? panY : 0
                          }px, 0) scale(${i === index ? zoom : 1})`,
                        }}
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
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-navy/90 via-navy/40 to-transparent sm:w-24" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-navy/90 via-navy/40 to-transparent sm:w-24" />
              </div>

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyZoom(zoomRef.current - 0.5);
                  }}
                  aria-label="Zoom out"
                  className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 active:scale-95"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M6 12h12" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  aria-label="Reset zoom"
                  className="min-w-[3.5rem] rounded-full bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 active:scale-95"
                >
                  {Math.round(zoom * 100)}%
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyZoom(zoomRef.current + 0.5);
                  }}
                  aria-label="Zoom in"
                  className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 active:scale-95"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M12 6v12M6 12h12" />
                  </svg>
                </button>
              </div>

              <p className="pointer-events-none absolute bottom-16 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                {index + 1} / {product.images.length}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
