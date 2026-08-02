import Reveal from "./Reveal";

export default function Gallery() {
  return (
    <section id="gallery" className="mx-auto max-w-7xl border-t border-white/10 px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Gallery
        </p>
        <h2 className="mt-3 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
          In Use
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          See our cabinets in real homes, offices, and warehouses.
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/15 bg-zinc-900/40 px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
            Under construction
          </span>
          <svg
            className="mt-8 h-14 w-14 text-blue-500/60"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 3L7.5 5H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-3.5L15 3H9zm3 15a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
          </svg>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
            We&apos;re organizing photos of our cabinets in real homes and
            offices. Check back soon — or message us and we&apos;ll send
            pictures right away.
          </p>
          <a
            href="https://www.facebook.com/profile.php?id=61572768444647"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-blue-500 active:scale-95"
          >
            Message Us for Photos
          </a>
        </div>
      </Reveal>
    </section>
  );
}
