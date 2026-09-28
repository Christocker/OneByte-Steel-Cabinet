import ExpandableGallery from "./ExpandableGallery";
import Reveal from "./Reveal";
import { getInventory, InventoryConfigurationError } from "@/lib/inventory";
import { CatalogConfigurationError } from "@/lib/catalog";
import { getAvailability } from "@/lib/availability";
import { getSiteUrl } from "@/lib/site";

async function getPublicInventory() {
  try {
    return await getInventory();
  } catch (error) {
    if (
      !(error instanceof InventoryConfigurationError) &&
      !(error instanceof CatalogConfigurationError)
    ) {
      // Supabase reachability/read failures surface to the error boundary.
      throw error;
    }

    // Keep the storefront available with an empty state until storage is configured.
    return [];
  }
}

function availabilityUrl(product: { preorder?: boolean; stock: number }): string {
  switch (getAvailability(product.preorder ?? false, product.stock)) {
    case "in-stock":
      return "https://schema.org/InStock";
    case "preorder":
      return "https://schema.org/PreOrder";
    default:
      return "https://schema.org/OutOfStock";
  }
}

export default async function Products() {
  const inventory = await getPublicInventory();
  const siteUrl = getSiteUrl();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: inventory.map((product, index) => {
      const numericPrice = Number(product.price.replace(/[^\d.]/g, ""));
      const image = product.images[0]
        ? product.images[0].startsWith("/")
          ? `${siteUrl}${product.images[0]}`
          : product.images[0]
        : undefined;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          ...(image ? { image } : {}),
          offers: Number.isFinite(numericPrice)
            ? {
                "@type": "Offer",
                priceCurrency: "PHP",
                price: numericPrice,
                availability: availabilityUrl(product),
              }
            : undefined,
        },
      };
    }),
  };

  return (
    <section id="products" className="mx-auto max-w-7xl border-t-2 border-beige-deep px-6 py-20 sm:px-8 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy">
          Available Now
        </p>
        <h2 className="mt-3 text-5xl font-bold text-navy sm:text-6xl lg:text-7xl">
          Our Cabinets
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy/80">
          Every cabinet in our collection — with live stock availability.
        </p>
        <p className="mx-auto mt-3 text-sm font-bold text-navy/70">
          <span aria-hidden="true">⚠ </span>Prices may change without prior notice.
        </p>
      </Reveal>

      <ExpandableGallery products={inventory} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </section>
  );
}
