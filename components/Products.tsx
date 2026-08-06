import ExpandableGallery from "./ExpandableGallery";
import Reveal from "./Reveal";
import { getInventory, InventoryConfigurationError } from "@/lib/inventory";
import { products } from "@/lib/products";

async function getPublicInventory() {
  try {
    return await getInventory();
  } catch (error) {
    if (!(error instanceof InventoryConfigurationError)) throw error;

    // Keep the storefront available with a conservative zero-stock state until storage is configured.
    return products.map((product) => ({ ...product, stock: 0 }));
  }
}

export default async function Products() {
  const inventory = await getPublicInventory();

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

      <ExpandableGallery products={inventory} />
    </section>
  );
}
