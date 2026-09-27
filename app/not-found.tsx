import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-beige px-6 py-20 text-center text-navy">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy/60">404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-navy/70">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
      >
        Back to home
      </Link>
    </main>
  );
}
