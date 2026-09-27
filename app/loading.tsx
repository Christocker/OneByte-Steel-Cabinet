export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-beige text-navy"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-beige-deep border-t-navy" />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy/60">Loading</p>
      </div>
    </main>
  );
}
