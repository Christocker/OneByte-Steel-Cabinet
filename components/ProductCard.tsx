"use client";

import Image from "next/image";
import { useState } from "react";

export type Product = {
  image: string;
  name: string;
  price: string;
  description: string;
  dimensions: string;
  features: string[];
  imageRatio: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-xl shadow-black/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-950/40">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: product.imageRatio }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white">{product.name}</h3>
        <p className="mt-3 text-2xl font-bold text-blue-500">₱{product.price}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-3.5 font-semibold text-white ring-1 ring-white/10 transition-all duration-300 hover:bg-blue-600 hover:ring-blue-500 active:scale-[0.98]"
        >
          {expanded ? "Hide Details" : "View Details"}
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div
          className={`grid transition-all duration-500 ease-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="leading-relaxed text-zinc-400">{product.description}</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Cabinet Details
                </h4>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-zinc-400">Dimensions</span>
                  <span className="font-medium text-zinc-200">{product.dimensions || "—"}</span>
                </div>

                <ul className="mt-4 space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-zinc-300">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
