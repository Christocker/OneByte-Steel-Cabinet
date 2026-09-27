import Image from "next/image";
import type { ReactNode } from "react";
import type { InventoryProduct } from "@/lib/products";
import { formatPriceDisplay } from "@/lib/format";
import {
  getAvailability,
  getAvailabilityLabel,
  getAvailabilityColor,
  getAvailabilityDotColor,
} from "@/lib/availability";

type CatalogCardShellProps = {
  product: InventoryProduct;
  onThumbnailClick?: (index: number) => void;
  children?: ReactNode;
  className?: string;
};

/**
 * Shared visual shell for a cabinet card. Used by the public catalog
 * (`ProductCard`) and by the admin product manager. Pass `children` to render
 * an admin control section directly beneath the card content.
 */
export default function CatalogCardShell({
  product,
  onThumbnailClick,
  children,
  className = "",
}: CatalogCardShellProps) {
  const itemNumber = product.displayItemNumber ?? product.itemNumber;
  const status = getAvailability(product.preorder ?? false, product.stock);
  const thumbnails = product.images.slice(0, 2);
  const clickable = typeof onThumbnailClick === "function";

  const thumbnailInner = (src: string, idx: number) => (
    <>
      <Image
        src={src}
        alt={`${product.name} — photo ${idx + 1}`}
        fill
        sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 16vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-navy/30 opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100">
        <svg
          className="h-7 w-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </span>
    </>
  );

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-beige-deep bg-beige-soft shadow-xl shadow-navy/20 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-navy/40 hover:shadow-2xl hover:shadow-navy/30 hover:z-10 ${className}`}
    >
      <p className="sr-only">{product.name}</p>

      <div className="grid grid-cols-2 gap-2 p-3">
        {thumbnails.map((src, idx) =>
          clickable ? (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => onThumbnailClick?.(idx)}
              aria-label={`View ${product.name} photo ${idx + 1} of ${product.images.length} in full size`}
              className="group/thumb relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              {thumbnailInner(src, idx)}
            </button>
          ) : (
            <div
              key={`${src}-${idx}`}
              className="group/thumb relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-beige"
            >
              {thumbnailInner(src, idx)}
            </div>
          )
        )}

        {product.images.length === 1 &&
          (clickable ? (
            <button
              type="button"
              onClick={() => onThumbnailClick?.(0)}
              aria-label={`View ${product.name} photo in full size`}
              className="group/thumb relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              <span className="absolute inset-0 flex items-center justify-center transition-colors duration-300 group-hover/thumb:bg-navy/10">
                <svg
                  className="h-7 w-7 text-navy/25 transition-colors duration-300 group-hover/thumb:text-navy/60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
            </button>
          ) : (
            <div className="group/thumb relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-beige" />
          ))}

        {product.images.length === 0 && (
          <div className="col-span-2 flex aspect-[3/2] w-full items-center justify-center rounded-2xl border-2 border-dashed border-beige-deep bg-beige text-sm font-medium text-navy/40">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-2">
        <h3 className="text-lg font-bold text-navy">{product.name}</h3>
        <div className="mt-1.5 mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-navy px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-beige-soft shadow-sm shadow-navy/20">
            Item #{itemNumber}
          </span>
        </div>
        <p className="text-2xl font-extrabold text-navy-light">
          {formatPriceDisplay(product.price)}
        </p>
        <p className="mt-1.5 text-[15px] font-semibold text-navy/80">{product.dimensions}</p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-navy/40">
          H × W × L
        </p>

        <div className="mt-auto flex items-center justify-end border-t border-beige-deep/70 pt-4">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${getAvailabilityColor(status)}`}
          >
            <span className={`h-2 w-2 rounded-full ${getAvailabilityDotColor(status)}`} />
            {getAvailabilityLabel(status)}
          </span>
        </div>
      </div>

      {children && (
        <div className="border-t-2 border-beige-deep/70 px-5 py-5">{children}</div>
      )}
    </article>
  );
}
