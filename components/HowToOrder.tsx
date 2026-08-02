const steps = [
  {
    number: "01",
    title: "Message Us",
    text: "Send us a message on Facebook, Viber, WhatsApp, or call us.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Pick Your Design",
    text: "Choose from our designs, or ask us to show you the full collection.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.3 7L12 12l8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Pay Your Way",
    text: "",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 010-4h14v4" />
        <path d="M3 5v14a2 2 0 002 2h16v-5" />
        <path d="M18 12a2 2 0 000 4h4v-4z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Receive Your Cabinet",
    text: "Get your cabinet — delivered to you or ready for pick up.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 001-1v-3.65a1 1 0 00-.22-.62l-3.48-4.35A1 1 0 0017.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    ),
  },
];

function DownArrow() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M19 12l-7 7-7-7" />
    </svg>
  );
}

function RightArrow() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HowToOrder() {
  return (
    <section id="how-to-order" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
      <div className="animate-fade-up text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          How to Order
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
          Ordering is Easy
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Four simple steps, and your cabinet is on its way.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        {steps.map((s, i) => {
          const turnsDown = i === 1;
          return (
            <div
              key={s.number}
              className="group relative animate-fade-up rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-xl shadow-black/40 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-950/40"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-6xl font-black leading-none text-transparent sm:text-7xl">
                  {s.number}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-950/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {s.icon}
                </div>
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>

              {i === 2 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-sm font-bold text-emerald-300">Via Lalamove</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Pay at pick up
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      Lalamove won&apos;t leave until the payment is complete.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                    <p className="text-sm font-bold text-blue-300">We Deliver</p>
                    <span className="mt-2 inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                      Pay after delivery
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      We deliver first, then you pay.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 leading-relaxed text-zinc-400">{s.text}</p>
              )}

              {i < steps.length - 1 && (
                <>
                  <div
                    className={`absolute -bottom-6 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-zinc-950 bg-blue-600 text-white shadow-lg shadow-blue-950/50 ${
                      turnsDown ? "" : "lg:hidden"
                    }`}
                  >
                    <DownArrow />
                  </div>
                  <div
                    className={`absolute -right-6 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-4 border-zinc-950 bg-blue-600 text-white shadow-lg shadow-blue-950/50 lg:flex ${
                      turnsDown ? "!hidden" : ""
                    }`}
                  >
                    <RightArrow />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-14 animate-fade-up text-center">
        <a
          href="https://www.facebook.com/profile.php?id=61572768444647"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-4 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 active:scale-95"
        >
          Start Your Order
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
