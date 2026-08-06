"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { InventoryProduct } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function ExpandableGallery({ products }: { products: InventoryProduct[] }) {
  const [expanded, setExpanded] = useState(false);
  const [columns, setColumns] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      const count = getComputedStyle(el).gridTemplateColumns.split(" ").length;
      if (count > 0) setColumns(count);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleCount = columns;
  const firstRow = products.slice(0, visibleCount);
  const hidden = products.slice(visibleCount);
  const hasMore = hidden.length > 0;

  const collapse = useCallback(() => {
    setExpanded(false);
    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  }, []);

  if (!hasMore) {
    return (
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    );
  }

  return (
    <>
      <div ref={gridRef} className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {firstRow.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>

      {!expanded && (
        <div
          className="pointer-events-none relative z-10 -mt-24 h-24"
          style={{
            background: "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      )}

      <div
        id="products-hidden-grid"
        className="expandable-container overflow-hidden"
        style={{
          maxHeight: expanded ? "8000px" : "0px",
          transition: "max-height 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {hidden.map((p, i) => (
            <div
              key={p.id}
              className="expandable-card"
              style={{
                opacity: expanded ? 1 : 0,
                transition: "opacity 0.5s ease-out",
                transitionDelay: expanded
                  ? `${i * 80}ms`
                  : `${Math.max(0, (hidden.length - 1 - i) * 50)}ms`,
              }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={expanded ? collapse : () => setExpanded(true)}
          aria-expanded={expanded}
          aria-controls="products-hidden-grid"
          className="inline-flex items-center gap-2 rounded-2xl bg-navy px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:bg-navy-light hover:shadow-xl hover:shadow-navy/30 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          {expanded ? "Show Less" : "View All Cabinets"}
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </>
  );
}
