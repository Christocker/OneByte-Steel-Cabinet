"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Elements already on screen (hero, first section) stay visible.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setHidden(true);

    let observer: IntersectionObserver | null = null;
    let shown = false;
    let ticking = false;

    const show = () => {
      if (shown) return;
      shown = true;
      setHidden(false);
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const check = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) show();
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) show();
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition duration-700 ease-out ${
        hidden ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={hidden ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
