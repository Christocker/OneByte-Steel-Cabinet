import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import type { Product } from "./ProductCard";

const products: Product[] = [
  {
    name: "Full Metal Cabinet — Light Gray",
    price: "5,800",
    dimensions: "180 × 80 × 40 cm",
    images: [
      "/images/products/steeline-full-metal-light-gray-1.png",
      "/images/products/steeline-full-metal-light-gray-2.png",
    ],
  },
  {
    name: "Full Glass Sliding Cabinet — Gray & White",
    price: "7,200",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-sliding-gray-white-1.jpg",
      "/images/products/worldcraft-full-glass-sliding-gray-white-2.png",
    ],
  },
  {
    name: "Full Glass Sliding Cabinet — White",
    price: "7,500",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-sliding-white-1.png",
      "/images/products/worldcraft-full-glass-sliding-white-2.jpg",
    ],
  },
  {
    name: "Full Glass Cabinet — White",
    price: "7,300",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-full-glass-white-1.png",
      "/images/products/worldcraft-full-glass-white-2.jpg",
    ],
  },
  {
    name: "Full Metal Cabinet — Gray & White",
    price: "6,000",
    dimensions: "185 × 85 × 40 cm",
    images: [
      "/images/products/worldcraft-full-metal-gray-white-1.png",
      "/images/products/worldcraft-full-metal-gray-white-2.jpg",
    ],
  },
  {
    name: "Half Glass Cabinet — White",
    price: "6,800",
    dimensions: "185 × 90 × 40 cm",
    images: [
      "/images/products/worldcraft-half-glass-white-1.png",
      "/images/products/worldcraft-half-glass-white-2.jpg",
    ],
  },
  {
    name: "Wardrobe Cabinet — Brown & Beige",
    price: "7,500",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-brown-beige-1.png",
      "/images/products/worldcraft-wardrobe-brown-beige-2.png",
    ],
  },
  {
    name: "Wardrobe with Shelves — Woodgrain",
    price: "7,200",
    dimensions: "185 × 90 × 45 cm",
    images: [
      "/images/products/worldcraft-wardrobe-shelves-woodgrain-1.png",
      "/images/products/worldcraft-wardrobe-shelves-woodgrain-2.png",
    ],
  },
];

export default function Products() {
  return (
    <section id="products" className="mx-auto max-w-7xl border-t border-beige-deep px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy">
          Available Now
        </p>
        <h2 className="mt-3 text-5xl font-bold text-navy sm:text-6xl lg:text-7xl">
          Our Cabinets
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy/70">
          Every cabinet we have in stock — size and price included.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.name} delay={i * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>

      <Reveal
        className="mt-14 rounded-3xl border border-beige-deep bg-beige-soft p-8 text-center shadow-lg shadow-navy/15"
        delay={200}
      >
        <h3 className="text-xl font-bold text-navy sm:text-2xl">
          Need a Different Style or Size?
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-navy/70">
          These are all our current cabinets — but we can get other styles,
          sizes, and colors for you. Message us and we&apos;ll show you what&apos;s
          available.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://www.facebook.com/profile.php?id=61572768444647"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-2xl bg-navy px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:bg-navy-light active:scale-95 sm:w-auto"
          >
            Message Us on Facebook
          </a>
          <a
            href="https://wa.me/639183811094"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-2xl border border-navy/25 bg-beige-soft px-8 py-4 text-center font-semibold text-navy backdrop-blur transition-all duration-300 hover:bg-navy hover:text-white active:scale-95 sm:w-auto"
          >
            Chat on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
