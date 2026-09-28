"use client";

import { useState } from "react";
import type { InventoryProduct } from "@/lib/products";
import CatalogCardShell from "./CatalogCardShell";
import PhotoLightbox from "./PhotoLightbox";

export default function ProductCard({ product }: { product: InventoryProduct }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <CatalogCardShell
        product={product}
        linkToProduct
        onThumbnailClick={(i) => {
          setIndex(i);
          setOpen(true);
        }}
      />

      <PhotoLightbox
        images={product.images}
        open={open}
        startIndex={index}
        onClose={() => setOpen(false)}
        label={`${product.name} photo viewer`}
        altPrefix={product.name}
      />
    </>
  );
}
