import Reveal from "./Reveal";

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
    <section id="about" className="mx-auto max-w-7xl border-t-2 border-beige-deep px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy">About Us</p>
        <h2 className="mt-3 text-5xl font-bold text-navy sm:text-6xl lg:text-7xl">Who We Are</h2>
      </Reveal>

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-lg leading-relaxed text-navy/70">
            OneByte Steel Cabinets sells premium steel cabinets for homes,
            offices, schools, and businesses. Full glass, full metal, sliding
            glass, and shelf-type styles — built from heavy-gauge steel to
            last.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-navy/70">
            Since 2024, we have been selling quality cabinets at the lowest
            prices, with friendly service from our base in Dasmariñas, Cavite.
            Whatever you need, we have it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#products"
              className="rounded-2xl bg-navy px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:bg-navy-light active:scale-95"
            >
              Browse Products
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61572768444647"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-navy/25 bg-beige-soft px-8 py-4 text-center font-semibold text-navy backdrop-blur transition-all duration-300 hover:bg-navy hover:text-white active:scale-95"
            >
              Message Us on Facebook
            </a>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {facts.map((f, i) => (
            <Reveal
              key={f.title}
              className="rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-lg shadow-navy/20 hover:-translate-y-1 hover:border-navy/40 hover:shadow-xl hover:shadow-navy/30"
              delay={i * 80}
            >
              <h3 className="text-lg font-bold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-16 grid items-center gap-8 rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-xl shadow-navy/20 sm:p-8 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <h3 className="text-2xl font-bold text-navy">Find Us</h3>
          <p className="mt-3 text-lg font-semibold text-navy-light">OneByte</p>
          <p className="mt-1 text-sm leading-relaxed text-navy/70">
            Dasmariñas, Cavite — drop by our store or message us anytime for
            inquiries and quotes.
          </p>
          <p className="mt-3 rounded-xl border border-amber-700/30 bg-amber-100/70 px-4 py-3 text-sm leading-relaxed text-amber-900">
            Please contact us first before visiting, so we can prepare your
            order.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://maps.app.goo.gl/hD3GWLsst9YMPEAh6"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-navy px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-navy-light active:scale-95"
            >
              Open in Google Maps
            </a>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=14.3389871%2C120.9322848"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-navy/25 bg-beige-soft px-6 py-3 text-center font-semibold text-navy backdrop-blur transition-all duration-300 hover:bg-navy hover:text-white active:scale-95"
            >
              Get Directions
            </a>
          </div>
        </div>
<div className="overflow-hidden rounded-2xl border-2 border-beige-deep">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1931.15!2d120.9322848!3d14.3389871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDIwJzIwLjQiTiAxMjDCsDU1JzU2LjIiRQ!5e0!3m2!1sen!2sph!4v1710000000000"
            title="OneByte Steel Cabinets location — Dasmariñas, Cavite"
            className="h-72 w-full border-0 sm:aspect-square sm:h-auto"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>
    </section>
  );
}
