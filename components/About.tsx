const facts = [
  {
    title: "Selling Since 2024",
    text: "Proudly serving customers with quality steel cabinets since 2024.",
  },
  {
    title: "Cheapest Seller",
    text: "Quality steel cabinets at the most affordable prices you'll find.",
  },
  {
    title: "Based in Dasmariñas, Cavite",
    text: "Located in Dasmariñas, Cavite — serving the whole region.",
  },
  {
    title: "Built to Last",
    text: "Heavy-gauge steel, quality finishes, and durable construction.",
  },
  {
    title: "Variety of Styles",
    text: "Full glass, full metal, sliding glass, shelf-type, and more.",
  },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl border-t border-white/10 px-6 py-20 sm:px-8 sm:py-24">
      <div className="animate-fade-up text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">About Us</p>
        <h2 className="mt-3 text-5xl font-bold text-white sm:text-7xl">Who We Are</h2>
      </div>

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-up">
          <p className="text-lg leading-relaxed text-zinc-400">
            OneByte Steel Cabinets sells premium steel cabinets for homes,
            offices, schools, and businesses. Full glass, full metal, sliding
            glass, and shelf-type styles — built from heavy-gauge steel to
            last.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Since 2024, we have been selling quality cabinets at the lowest
            prices, with friendly service from our base in Dasmariñas, Cavite.
            Whatever you need, we have it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#products"
              className="rounded-2xl bg-blue-600 px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:bg-blue-500 active:scale-95"
            >
              Browse Products
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61572768444647"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-center font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
            >
              Message Us on Facebook
            </a>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {facts.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-up rounded-3xl border border-white/10 bg-zinc-900/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/30"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid animate-fade-up items-center gap-8 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-xl shadow-black/40 sm:p-8 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <h3 className="text-2xl font-bold text-white">Find Us</h3>
          <p className="mt-3 text-lg font-semibold text-blue-400">OneByte</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Dasmariñas, Cavite — drop by our store or message us anytime for
            inquiries and quotes.
          </p>
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-300">
            Please contact us first before visiting, so we can prepare your
            order.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://maps.app.goo.gl/hD3GWLsst9YMPEAh6"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-blue-500 active:scale-95"
            >
              Open in Google Maps
            </a>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=14.3389871%2C120.9322848"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-center font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
            >
              Get Directions
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1931.15!2d120.9322848!3d14.3389871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDIwJzIwLjQiTiAxMjDCsDU1JzU2LjIiRQ!5e0!3m2!1sen!2sph!4v1710000000000"
            title="OneByte Steel Cabinets location — Dasmariñas, Cavite"
            className="h-72 w-full border-0 sm:aspect-square sm:h-auto"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
