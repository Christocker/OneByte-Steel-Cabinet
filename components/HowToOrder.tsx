const steps = [
  {
    number: "01",
    title: "Message Us",
    text: "Send us a message on Facebook, Viber, WhatsApp, or call us.",
  },
  {
    number: "02",
    title: "Pick Your Design",
    text: "Choose from our designs, or ask us to show you the full collection.",
  },
  {
    number: "03",
    title: "Pay Your Way",
    text: "",
    payment: true,
  },
  {
    number: "04",
    title: "Receive Your Cabinet",
    text: "Get your cabinet — delivered to you or ready for pick up.",
  },
];

function StepNumber({ number }: { number: string }) {
  return (
    <div className="relative z-10 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-black text-white shadow-lg shadow-blue-950/50 ring-4 ring-zinc-950">
      {number}
    </div>
  );
}

function PaymentOptions() {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left">
        <p className="text-base font-bold text-emerald-300">Via Lalamove</p>
        <span className="mt-2 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
          Pay at pick up
        </span>
        <p className="mt-3 text-base leading-relaxed text-zinc-300">
          Lalamove won&apos;t leave until the payment is complete.
        </p>
      </div>
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 text-left">
        <p className="text-base font-bold text-blue-300">We Deliver</p>
        <span className="mt-2 inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-sm font-semibold text-blue-300">
          Pay after delivery
        </span>
        <p className="mt-3 text-base leading-relaxed text-zinc-300">
          We deliver first, then you pay.
        </p>
      </div>
    </div>
  );
}

export default function HowToOrder() {
  return (
    <section id="how-to-order" className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-28">
      <div className="animate-fade-up text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          How to Order
        </p>
        <h2 className="mt-3 text-5xl font-bold text-white sm:text-7xl">
          Ordering is Easy
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-xl text-zinc-400">
          Four simple steps, and your cabinet is on its way.
        </p>
      </div>

      <div className="relative mt-24 hidden lg:block">
        <div className="absolute left-10 right-10 top-10 border-t-2 border-dashed border-white/10" />
        <div className="grid grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div
              key={s.number}
              className="relative flex animate-fade-up flex-col items-center text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <StepNumber number={s.number} />
              <h3 className="mt-6 text-xl font-bold text-white">{s.title}</h3>
              {s.payment ? (
                <PaymentOptions />
              ) : (
                <p className="mt-3 text-base leading-relaxed text-zinc-400">{s.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-16 lg:hidden">
        <div className="absolute bottom-6 left-10 top-6 border-l-2 border-dashed border-white/10" />
        <div className="space-y-12">
          {steps.map((s, i) => (
            <div
              key={s.number}
              className="relative flex animate-fade-up gap-5"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <StepNumber number={s.number} />
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold text-white">{s.title}</h3>
                {s.payment ? (
                  <PaymentOptions />
                ) : (
                  <p className="mt-3 text-base leading-relaxed text-zinc-400">{s.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 animate-fade-up text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-12 py-5 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 active:scale-95"
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
