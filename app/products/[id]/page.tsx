import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getInventoryProductById } from "@/lib/inventory";
import { getAvailability, getAvailabilityLabel } from "@/lib/availability";
import { formatPriceDisplay } from "@/lib/format";
import { getSiteUrl } from "@/lib/site";

type RouteParams = { params: Promise<{ id: string }> };

async function loadProduct(id: string) {
  try {
    return await getInventoryProductById(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  // Resolve the 404 before the response streams so the status code is a real 404.
  if (!product) notFound();

  const price = formatPriceDisplay(product.price);
  const title = `${product.name} — ${price}`;
  const availability = getAvailabilityLabel(
    getAvailability(product.preorder ?? false, product.stock)
  );
  const description = `${product.name} · ${product.dimensions} · ${availability}. Available at OneByte Steel Cabinets, Dasmariñas, Cavite. Message us for delivery or pick-up.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}/products/${product.id}`,
      type: "website",
      ...(product.images[0] ? { images: [{ url: product.images[0] }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: RouteParams) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) notFound();

  const siteUrl = getSiteUrl();
  const status = getAvailability(product.preorder ?? false, product.stock);
  const numericPrice = Number(product.price.replace(/[^\d.]/g, ""));
  const image = product.images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(image
      ? { image: image.startsWith("/") ? `${siteUrl}${image}` : image }
      : {}),
    ...(Number.isFinite(numericPrice) && product.price.trim().length > 0
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "PHP",
            price: numericPrice,
            availability:
              status === "in-stock"
                ? "https://schema.org/InStock"
                : status === "preorder"
                  ? "https://schema.org/PreOrder"
                  : "https://schema.org/OutOfStock",
            url: `${siteUrl}/products/${product.id}`,
          },
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-beige pb-24 text-navy sm:pb-0">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <Link
          href="/"
          className="text-sm font-semibold text-navy/70 transition-colors hover:text-navy"
        >
          ← Back to all cabinets
        </Link>

        <div className="mt-6">
          <ProductCard product={product} />
        </div>

        <p className="mt-6 text-sm text-navy/70">
          Prices and stock may change without prior notice. Message us to confirm
          availability, delivery fee, and pick-up schedule.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
