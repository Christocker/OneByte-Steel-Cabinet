"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import PriceInput from "./PriceInput";
import { formatPriceDisplay } from "@/lib/format";

type ProductFormProps = {
  mode: "add" | "edit";
  initial?: CatalogProduct & { stock?: number };
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
};

export type ProductFormData = {
  name: string;
  brand: string;
  price: string;
  dimensions: string;
  images: string[];
  stock: number;
  preorder: boolean;
};

export default function ProductForm({ mode, initial, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [preorder, setPreorder] = useState(initial?.preorder ?? false);

  // Parse dimensions from string like "180 × 80 × 40 cm" or "180 × 80 × 40 in"
  function parseDimensions(raw: string): { h: string; w: string; d: string; unit: "cm" | "in" } {
    const match = raw.match(/^([\d.]*)\s*[×x]\s*([\d.]*)\s*[×x]\s*([\d.]*)\s*(cm|in)?$/i);
    if (match) {
      return { h: match[1], w: match[2], d: match[3], unit: (match[4]?.toLowerCase() as "cm" | "in") || "cm" };
    }
    return { h: "", w: "", d: "", unit: "cm" };
  }

  const parsed = parseDimensions(initial?.dimensions ?? "");
  const [dimH, setDimH] = useState(parsed.h);
  const [dimW, setDimW] = useState(parsed.w);
  const [dimD, setDimD] = useState(parsed.d);
  const [dimUnit, setDimUnit] = useState<"cm" | "in">(parsed.unit);

  function getDimensionsString(): string {
    if (!dimH || !dimW || !dimD) return "";
    return `${dimH} × ${dimW} × ${dimD} ${dimUnit}`;
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Product name is required.";
    else if (name.length > 200) e.name = "Must be 200 characters or fewer.";
    if (!brand.trim()) e.brand = "Brand is required.";
    else if (brand.length > 100) e.brand = "Must be 100 characters or fewer.";
    if (!price.trim()) e.price = "Price is required.";
    else if (price.length > 100) e.price = "Must be 100 characters or fewer.";
    const dims = getDimensionsString();
    if (!dims) e.dimensions = "All dimension fields are required.";
    else if (dims.length > 100) e.dimensions = "Dimensions must be 100 characters or fewer.";
    if (images.length === 0) e.images = "Add at least one product image.";
    if (!Number.isInteger(stock) || stock < 0) e.stock = "Stock must be a non-negative integer.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("product_id", initial?.id || "new-product");
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = (await res.json()) as { url?: string };
          if (data.url) newUrls.push(data.url);
        }
      } catch {
        // skip failed uploads
      }
    }
    if (newUrls.length > 0) setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        name: name.trim(),
        brand: brand.trim(),
        price: price.trim(),
        dimensions: getDimensionsString(),
        images,
        stock,
        preorder,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="pf-name" className="text-sm font-semibold text-navy">Product Name</label>
        <input
          id="pf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
          className="mt-2 h-12 w-full rounded-xl border-2 border-beige-deep bg-beige px-4 text-navy outline-none transition-colors focus:border-navy"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="pf-brand" className="text-sm font-semibold text-navy">Brand</label>
        <input
          id="pf-brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
          maxLength={100}
          className="mt-2 h-12 w-full rounded-xl border-2 border-beige-deep bg-beige px-4 text-navy outline-none transition-colors focus:border-navy"
        />
        {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
      </div>

      <div>
        <label htmlFor="pf-price" className="text-sm font-semibold text-navy">Price</label>
        <PriceInput
          id="pf-price"
          value={price}
          onChange={setPrice}
          invalid={!!errors.price}
        />
        <p className="mt-1 text-xs text-navy/40">Stored as: {price || "—"}. Displayed as: {formatPriceDisplay(price || "0")}</p>
        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Dimensions</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <div>
            <span className="text-[11px] font-medium text-navy/40">Height</span>
            <input
              type="number"
              value={dimH}
              onChange={(e) => setDimH(e.target.value)}
              placeholder="0"
              min="0"
              className="mt-1 h-11 w-full rounded-xl border-2 border-beige-deep bg-beige px-3 text-center text-sm font-semibold text-navy outline-none transition-colors focus:border-navy"
            />
          </div>
          <div>
            <span className="text-[11px] font-medium text-navy/40">Width</span>
            <input
              type="number"
              value={dimW}
              onChange={(e) => setDimW(e.target.value)}
              placeholder="0"
              min="0"
              className="mt-1 h-11 w-full rounded-xl border-2 border-beige-deep bg-beige px-3 text-center text-sm font-semibold text-navy outline-none transition-colors focus:border-navy"
            />
          </div>
          <div>
            <span className="text-[11px] font-medium text-navy/40">Length</span>
            <input
              type="number"
              value={dimD}
              onChange={(e) => setDimD(e.target.value)}
              placeholder="0"
              min="0"
              className="mt-1 h-11 w-full rounded-xl border-2 border-beige-deep bg-beige px-3 text-center text-sm font-semibold text-navy outline-none transition-colors focus:border-navy"
            />
          </div>
          <div>
            <span className="text-[11px] font-medium text-navy/40">Unit</span>
            <select
              value={dimUnit}
              onChange={(e) => setDimUnit(e.target.value as "cm" | "in")}
              className="mt-1 h-11 w-full rounded-xl border-2 border-beige-deep bg-beige px-2 text-center text-sm font-semibold text-navy outline-none transition-colors focus:border-navy"
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
        {dimH && dimW && dimD && (
          <p className="mt-1.5 text-xs text-navy/40">Preview: {getDimensionsString()}</p>
        )}
        {errors.dimensions && <p className="mt-1 text-xs text-red-600">{errors.dimensions}</p>}
      </div>

      <div>
        <label htmlFor="pf-stock" className="text-sm font-semibold text-navy">Stock</label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStock((s: number) => Math.max(0, s - 1))}
            aria-label="Decrease stock"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-beige-deep bg-beige text-lg font-bold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            -
          </button>
          <input
            id="pf-stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="h-10 w-20 rounded-xl border-2 border-beige-deep bg-beige px-3 text-center text-navy outline-none focus:border-navy"
          />
          <button
            type="button"
            onClick={() => setStock((s: number) => s + 1)}
            aria-label="Increase stock"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-beige-deep bg-beige text-lg font-bold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            +
          </button>
        </div>
        {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Pre-Order</label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreorder(!preorder)}
            aria-label="Pre-order"
            aria-pressed={preorder}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${
              preorder ? "bg-amber-500" : "bg-navy/20"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                preorder ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-navy">{preorder ? "ON" : "OFF"}</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-navy">Product Images</label>
        {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-beige-deep">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white hover:bg-red-700"
              >
                x
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-beige-deep text-2xl text-navy/30 transition-colors hover:border-navy/40 hover:text-navy/50">
            +
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
        {uploading && <p className="mt-1 text-xs text-navy/50">Uploading...</p>}
      </div>

      {submitError && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">{submitError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex h-12 items-center justify-center rounded-xl bg-navy px-8 font-semibold text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : mode === "add" ? "Add Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-12 items-center justify-center rounded-xl border-2 border-beige-deep px-6 font-semibold text-navy transition-colors hover:bg-beige"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
