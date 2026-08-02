"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Only animate content that starts below the viewport. Elements already
    // on screen (hero, first section) render visible with no JS dependency.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setHidden(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition duration-700 ease-out ${
        hidden ? "translate-y-10 opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={hidden ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
