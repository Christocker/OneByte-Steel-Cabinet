"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition, Variants } from "motion/react";
import type { InventoryProduct } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

const STAGGER_IN_SECONDS = 0.05;
const STAGGER_OUT_SECONDS = 0.03;
const CARD_Y_OFFSET = 24;
const CARD_BLUR_PX = 4;
const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
const DRAWER_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export default function ExpandableGallery({ products }: { products: InventoryProduct[] }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [columns, setColumns] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

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

  // Always show at least three cabinets, even when the grid is a single column
  // on mobile, so the catalog is never reduced to one visible product.
  const visibleCount = Math.max(3, columns);
  const firstRow = products.slice(0, visibleCount);
  const hidden = products.slice(visibleCount);
  const hasMore = hidden.length > 0;
  const count = hidden.length;

  const cardVariants: Variants = {
    visible: (i: number): TargetAndTransition => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: reduce
        ? { duration: 0 }
        : { ...SPRING, delay: i * STAGGER_IN_SECONDS },
    }),
    hidden: (i: number): TargetAndTransition => ({
      opacity: 0,
      y: CARD_Y_OFFSET,
      filter: reduce ? "blur(0px)" : `blur(${CARD_BLUR_PX}px)`,
      transition: reduce
        ? { duration: 0 }
        : { ...SPRING, delay: Math.max(0, count - 1 - i) * STAGGER_OUT_SECONDS },
    }),
  };

  const drawerTransition: Transition = reduce ? { duration: 0 } : SPRING;

  const toggle = () => {
    if (!open) setHasOpened(true);
    setOpen((prev) => !prev);
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
        ref={drawerRef}
        className="relative overflow-hidden"
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={drawerTransition}
        inert={!open}
        aria-hidden={!open}
      >
        <div className="grid gap-8 pt-8 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {hasOpened &&
            hidden.map((p, i) => (
              <motion.div
                key={p.id}
                variants={cardVariants}
                custom={i}
                initial="hidden"
                animate={open ? "visible" : "hidden"}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
        </div>
      </motion.div>

      <div className="mt-10 text-center">
        <motion.button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="products-hidden-grid"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-navy px-8 py-4 font-semibold text-white transition-colors duration-300 hover:bg-navy-light hover:shadow-xl hover:shadow-navy/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <span className="relative inline-flex h-6 min-w-[11rem] items-center justify-center overflow-hidden">
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={open ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              View All Cabinets ({count} more)
            </motion.span>
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              Show Less
            </motion.span>
          </span>
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.4, ease: DRAWER_EASE }}
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
