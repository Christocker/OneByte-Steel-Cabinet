import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

const products: Product[] = [
  {
    image: "/images/products/full-glass.jpg",
    name: "Full Glass Cabinet",
    price: "6,800",
    imageRatio: "3 / 4",
    description:
      "Full-glass cabinet with clear swing doors and a sturdy steel frame.",
    dimensions: "",
    features: [
      "Full glass swing doors",
      "Heavy-gauge steel body",
      "Adjustable steel shelving",
      "Secure locking system",
    ],
  },
  {
    image: "/images/products/full-metal.jpg",
    name: "Full Metal Cabinet",
    price: "5,800",
    imageRatio: "1 / 1",
    description:
      "All-metal cabinet for maximum security and durability.",
    dimensions: "",
    features: [
      "All-metal construction",
      "Rust-resistant powder-coated finish",
      "Swing-type metal doors",
      "Secure locking system",
    ],
  },
  {
    image: "/images/products/sliding-glass-white.jpg",
    name: "Storage Cabinet with Sliding Glass Doors",
    price: "6,000",
    imageRatio: "2 / 3",
    description:
      "White storage cabinet with sliding glass doors.",
    dimensions: "",
    features: [
      "White powder-coated steel body",
      "Sliding glass doors",
      "Spacious internal shelving",
      "Smooth-glide runners",
    ],
  },
];

export default function Products() {
  return (
    <section id="products" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
      <div className="animate-fade-up text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Our Collection
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
          Featured Products
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Best-selling steel cabinets, crafted to last.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <div key={p.name} className="animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div
        className="mt-14 animate-fade-up rounded-3xl border border-white/10 bg-zinc-900/80 p-8 text-center backdrop-blur"
        style={{ animationDelay: "360ms" }}
      >
        <h3 className="text-xl font-bold text-white sm:text-2xl">
          Looking for Other Designs?
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-zinc-400">
          These are just our best-sellers — we have many more styles and
          sizes, including metal, glass, sliding, and shelf-type cabinets.
          Message us and we{"'"}ll show you our full collection.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://www.facebook.com/profile.php?id=61572768444647"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:bg-blue-500 active:scale-95 sm:w-auto"
          >
            Message Us on Facebook
          </a>
          <a
            href="https://wa.me/639183811094"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-center font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-black active:scale-95 sm:w-auto"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
