"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import type { InventoryProduct } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

const STAGGER_SECONDS = 0.04;
const CARD_OUT_SECONDS = 0.35;
const PARENT_COLLAPSE_SECONDS = 0.55;
const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

function buildVariants(reduce: boolean) {
  const container: Variants = reduce
    ? {
        expanded: { height: "auto" },
        collapsed: { height: 0 },
      }
    : {
        expanded: {
          height: "auto",
          transition: {
            duration: 0.75,
            ease: EASE,
            staggerChildren: STAGGER_SECONDS,
          },
        },
        collapsed: {
          height: 0,
          transition: {
            duration: PARENT_COLLAPSE_SECONDS,
            ease: EASE,
            when: "afterChildren",
            staggerChildren: STAGGER_SECONDS,
            staggerDirection: -1,
          },
        },
      };

  const card: Variants = reduce
    ? {
        expanded: { opacity: 1, transition: { duration: 0.15 } },
        collapsed: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        expanded: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: EASE },
        },
        collapsed: {
          opacity: 0,
          y: 20,
          scale: 0.97,
          transition: { duration: CARD_OUT_SECONDS, ease: "easeIn" },
        },
      };

  return { container, card };
}

export default function ExpandableGallery({ products }: { products: InventoryProduct[] }) {
  const [expanded, setExpanded] = useState(false);
  const [columns, setColumns] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const { container: containerVariants, card: cardVariants } = useMemo(
    () => buildVariants(!!reduce),
    [reduce]
  );

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

  useLayoutEffect(() => {
    return () => {
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, []);

  const visibleCount = columns;
  const firstRow = products.slice(0, visibleCount);
  const hidden = products.slice(visibleCount);
  const hasMore = hidden.length > 0;

  const toggle = () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    setExpanded((prev) => {
      if (prev) {
        const totalMs =
          ((hidden.length - 1) * STAGGER_SECONDS + CARD_OUT_SECONDS + PARENT_COLLAPSE_SECONDS) *
            1000 +
          60;
        scrollTimer.current = window.setTimeout(() => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document
            .getElementById("products")
            ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        }, totalMs);
      }
      return !prev;
    });
  };

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

      <motion.div
        id="products-hidden-grid"
        className="overflow-hidden"
        variants={containerVariants}
        initial={false}
        animate={expanded ? "expanded" : "collapsed"}
      >
        <div className="mt-8 grid gap-8 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {hidden.map((p) => (
            <motion.div key={p.id} variants={cardVariants}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="mt-10 text-center">
        <motion.button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls="products-hidden-grid"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-navy px-8 py-4 font-semibold text-white transition-colors duration-300 hover:bg-navy-light hover:shadow-xl hover:shadow-navy/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <span className="relative inline-flex h-6 min-w-[9rem] items-center justify-center overflow-hidden">
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={expanded ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              View All Cabinets
            </motion.span>
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={expanded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              Show Less
            </motion.span>
          </span>
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.button>
      </div>
    </>
  );
}
