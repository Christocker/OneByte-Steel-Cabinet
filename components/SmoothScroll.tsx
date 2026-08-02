"use client";

import { useEffect } from "react";

const NAV_OFFSET = 96;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!anchor) return;

      const hash = anchor.getAttribute("href") ?? "";
      if (reduceMotion) return;
      const id = hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (id && !target) return;

      e.preventDefault();

      const targetY = target
        ? target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
        : 0;
      const startY = window.scrollY;
      const distance = targetY - startY;

      if (Math.abs(distance) < 1) {
        window.scrollTo(0, targetY);
      } else {
        const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 400), 900);
        const startTime = performance.now();
        const prev = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";

        function step(now: number) {
          const t = Math.min((now - startTime) / duration, 1);
          window.scrollTo(0, startY + distance * easeInOutCubic(t));
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            document.documentElement.style.scrollBehavior = prev;
          }
        }
        requestAnimationFrame(step);
      }

      try {
        history.pushState(null, "", hash);
      } catch {
        // ignore — pushState fails on some file:// or sandboxed contexts
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
