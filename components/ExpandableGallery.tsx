"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import type { InventoryProduct } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

const STAGGER_SECONDS = 0.06;
const CARD_IN_SECONDS = 1.2;
const CARD_OUT_SECONDS = 1.0;
const CONTAINER_SECONDS = 1.3;
const DRAWER_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export default function ExpandableGallery({ products }: { products: InventoryProduct[] }) {
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState(3);
  const [depths, setDepths] = useState<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<{
    y0: number;
    h0: number;
    prevScrollBehavior: string | null;
  } | null>(null);
  const reduce = useReducedMotion();

  const clearFollow = () => {
    const f = followRef.current;
    if (f && f.prevScrollBehavior !== null) {
      document.documentElement.style.scrollBehavior = f.prevScrollBehavior;
    }
    followRef.current = null;
  };

  useEffect(() => {
    const onInput = clearFollow;
    window.addEventListener("touchstart", onInput, { passive: true });
    window.addEventListener("wheel", onInput, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onInput);
      window.removeEventListener("wheel", onInput);
      clearFollow();
    };
  }, []);

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
    const drawer = drawerRef.current;
    if (!drawer) return;
    const measure = () => {
      const cells = Array.from(drawer.children[0].children) as HTMLElement[];
      setDepths(cells.map((el) => el.offsetTop));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(drawer);
    return () => ro.disconnect();
  }, []);

  const visibleCount = columns;
  const firstRow = products.slice(0, visibleCount);
  const hidden = products.slice(visibleCount);
  const hasMore = hidden.length > 0;
  const count = hidden.length;

  const cardVariants: Variants = {
    visible: (i: number): TargetAndTransition => ({
      y: 0,
      transition: {
        delay: reduce ? 0 : i * STAGGER_SECONDS,
        duration: reduce ? 0.15 : CARD_IN_SECONDS,
        ease: reduce ? "easeOut" : DRAWER_EASE,
      },
    }),
    hidden: (i: number): TargetAndTransition => ({
      y: -(depths[i] ?? 0),
      transition: {
        delay: reduce ? 0 : Math.max(0, count - 1 - i) * STAGGER_SECONDS,
        duration: reduce ? 0.15 : CARD_OUT_SECONDS,
        ease: "easeIn",
      },
    }),
  };

  const toggle = () => {
    if (open && !reduce) {
      const drawer = drawerRef.current;
      if (drawer) {
        const html = document.documentElement;
        followRef.current = {
          y0: window.scrollY,
          h0: drawer.getBoundingClientRect().height,
          prevScrollBehavior: html.style.scrollBehavior,
        };
        html.style.scrollBehavior = "auto";
      }
    }
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
        transition={
          reduce
            ? { duration: 0 }
            : { duration: CONTAINER_SECONDS, ease: DRAWER_EASE }
        }
        onUpdate={(latest) => {
          const f = followRef.current;
          if (!f || typeof latest.height !== "number") return;
          window.scrollTo(0, f.y0 + latest.height - f.h0);
        }}
        onAnimationComplete={clearFollow}
      >
        <div className="grid gap-8 pt-8 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {hidden.map((p, i) => (
            <motion.div
              key={p.id}
              variants={cardVariants}
              custom={i}
              initial={false}
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
          <span className="relative inline-flex h-6 min-w-[9rem] items-center justify-center overflow-hidden">
            <motion.span
              className="absolute w-full text-center"
              initial={false}
              animate={open ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              View All Cabinets
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
