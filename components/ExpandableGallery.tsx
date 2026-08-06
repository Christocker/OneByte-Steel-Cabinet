"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import type { InventoryProduct } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

const STAGGER_SECONDS = 0.04;
const CARD_IN_SECONDS = 0.5;
const CARD_OUT_SECONDS = 0.35;
const CONTAINER_IN_SECONDS = 0.75;
const CONTAINER_OUT_SECONDS = 0.55;
const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const NAV_OFFSET = 96;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY: number) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;
  const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 400), 900);
  const startTime = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function ExpandableGallery({ products }: { products: InventoryProduct[] }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [columns, setColumns] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
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

  useLayoutEffect(() => {
    return () => {
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, []);

  const visibleCount = columns;
  const firstRow = products.slice(0, visibleCount);
  const hidden = products.slice(visibleCount);
  const hasMore = hidden.length > 0;
  const count = hidden.length;

  const cardVariants: Variants = {
    visible: (i: number): TargetAndTransition => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: reduce ? 0 : i * STAGGER_SECONDS,
        duration: reduce ? 0.15 : CARD_IN_SECONDS,
        ease: reduce ? "easeOut" : EASE,
      },
    }),
    hidden: (i: number): TargetAndTransition => ({
      opacity: 0,
      y: reduce ? 0 : 20,
      scale: reduce ? 1 : 0.97,
      transition: {
        delay: reduce ? 0 : (count - 1 - i) * STAGGER_SECONDS,
        duration: reduce ? 0.15 : CARD_OUT_SECONDS,
        ease: "easeIn",
      },
    }),
  };

  const collapse = () => {
    setClosing(true);
    const cardsDoneMs = ((count - 1) * STAGGER_SECONDS + CARD_OUT_SECONDS) * 1000;
    scrollTimer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      scrollTimer.current = window.setTimeout(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const section = document.getElementById("products");
        if (section) {
          const targetY = section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
          if (reduced) window.scrollTo(0, targetY);
          else smoothScrollTo(targetY);
        }
      }, CONTAINER_OUT_SECONDS * 1000 + 60);
    }, cardsDoneMs + 20);
  };

  const toggle = () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    if (open && !closing) {
      collapse();
    } else {
      setOpen(true);
      setClosing(false);
    }
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
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: open ? CONTAINER_IN_SECONDS : CONTAINER_OUT_SECONDS,
                ease: EASE,
              }
        }
      >
        <div className="mt-8 grid gap-8 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {hidden.map((p, i) => (
            <motion.div
              key={p.id}
              variants={cardVariants}
              custom={i}
              initial={false}
              animate={open && !closing ? "visible" : "hidden"}
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
          <span className="relative inline-flex h-6 min-w-[9rem] items-center justify-center overflow-hidden">
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={open ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              View All Cabinets
            </motion.span>
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              Show Less
            </motion.span>
          </span>
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
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
