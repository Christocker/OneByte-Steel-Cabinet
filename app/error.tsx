"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-beige px-6 py-20 text-center text-navy">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy/60">
        Something went wrong
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        We could not load this page
      </h1>
      <p className="mt-4 max-w-md text-navy/70">
        Please try again. If the problem continues, contact us directly and we will help you find
        the cabinet you need.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
      >
        Try again
      </button>
    </main>
  );
}
