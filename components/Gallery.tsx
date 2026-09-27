"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import PhotoLightbox from "./PhotoLightbox";

type Photo = {
  src: string;
  w: number;
  h: number;
};

const photos: Photo[] = [
  { src: "/images/gallery/gallery-01.jpg", w: 900, h: 1600 },
  { src: "/images/gallery/gallery-02.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-03.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-04.jpg", w: 944, h: 1600 },
  { src: "/images/gallery/gallery-05.jpg", w: 1600, h: 1200 },
  { src: "/images/gallery/gallery-06.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-07.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-08.jpg", w: 1600, h: 1200 },
  { src: "/images/gallery/gallery-09.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-10.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-11.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-12.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-13.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-14.jpg", w: 1200, h: 1600 },
  { src: "/images/gallery/gallery-15.jpg", w: 1200, h: 1600 },
];

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const galleryImages = useMemo(() => photos.map((p) => p.src), []);

  return (
    <section id="gallery" className="mx-auto max-w-7xl border-t-2 border-beige-deep px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy">
          Gallery
        </p>
        <h2 className="mt-3 text-5xl font-bold text-navy sm:text-6xl lg:text-7xl">
          In Use
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy/70">
          Photos of our cabinets at customers&apos; homes and offices.
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`View photo ${i + 1} of ${photos.length}`}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border-2 border-beige-deep shadow-lg shadow-navy/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
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
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-navy/70 p-3 backdrop-blur">
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

      <PhotoLightbox
        images={galleryImages}
        open={openIndex !== null}
        startIndex={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        label="Photo viewer"
        altPrefix="OneByte cabinet"
      />
    </section>
  );
}
