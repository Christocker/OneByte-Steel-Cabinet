import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import { getInventory } from "@/lib/inventory";

export default async function Products() {
  const inventory = await getInventory();

  return (
    <section id="products" className="mx-auto max-w-7xl border-t-2 border-beige-deep px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy">
          Available Now
        </p>
        <h2 className="mt-3 text-5xl font-bold text-navy sm:text-6xl lg:text-7xl">
          Our Cabinets
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy/70">
           Every cabinet in our collection — with live stock availability.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
         {inventory.map((p, i) => (
           <Reveal key={p.id} delay={i * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
