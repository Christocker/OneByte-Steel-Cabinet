"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { InventoryProduct } from "@/lib/products";
import { parseStockValue, MAX_STOCK } from "@/lib/inventory-validation";
import { buildDimensions, parseDimensions, type DimensionUnit } from "@/lib/dimensions";
import CatalogCardShell from "@/components/CatalogCardShell";
import PhotoLightbox from "@/components/PhotoLightbox";
import PriceInput from "./PriceInput";

type AdminProductCardProps = {
  product: InventoryProduct;
  editing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSaved: (product: InventoryProduct) => void;
  onDeleted: (id: string) => void;
  onUnauthorized: () => void;
};

export default function AdminProductCard({
  product,
  editing,
  onEdit,
  onCloseEdit,
  onDirtyChange,
  onSaved,
  onDeleted,
  onUnauthorized,
}: AdminProductCardProps) {
  const initialDims = parseDimensions(product.dimensions);
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand);
  const [price, setPrice] = useState(product.price);
  const [dimH, setDimH] = useState(initialDims.h);
  const [dimW, setDimW] = useState(initialDims.w);
  const [dimD, setDimD] = useState(initialDims.d);
  const [dimUnit, setDimUnit] = useState<DimensionUnit>(initialDims.unit);
  const [stock, setStock] = useState(String(product.stock));
  const [preorder, setPreorder] = useState(product.preorder ?? false);
  const [assemblyRecommended, setAssemblyRecommended] = useState(
    product.assembly_recommended ?? false
  );
  const [images, setImages] = useState<string[]>(product.images);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [quickSaving, setQuickSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [notice, setNotice] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dimensions = buildDimensions(dimH, dimW, dimD, dimUnit);
  // Normalize the stored dimensions the same way so a canonical-but-different
  // stored string does not read as an unsaved change.
  const normalizedStoredDimensions = buildDimensions(
    initialDims.h,
    initialDims.w,
    initialDims.d,
    initialDims.unit
  );
  const stockNumber = parseStockValue(stock);

  const preview: InventoryProduct = {
    ...product,
    name: name || "Untitled product",
    brand,
    price,
    dimensions: dimensions || product.dimensions,
    images,
    preorder,
    assembly_recommended: assemblyRecommended,
    stock: stockNumber ?? 0,
  };

  const dirty =
    name !== product.name ||
    brand !== product.brand ||
    price !== product.price ||
    dimensions !== normalizedStoredDimensions ||
    stock !== String(product.stock) ||
    preorder !== (product.preorder ?? false) ||
    assemblyRecommended !== (product.assembly_recommended ?? false) ||
    images.join("|") !== product.images.join("|");

  // Let the dashboard know about unsaved changes so it can warn before
  // switching edit mode to another card.
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  function resetForm() {
    const parsed = parseDimensions(product.dimensions);
    setName(product.name);
    setBrand(product.brand);
    setPrice(product.price);
    setDimH(parsed.h);
    setDimW(parsed.w);
    setDimD(parsed.d);
    setDimUnit(parsed.unit);
    setStock(String(product.stock));
    setPreorder(product.preorder ?? false);
    setAssemblyRecommended(product.assembly_recommended ?? false);
    setImages(product.images);
    setErrors({});
    setNotice("");
  }

  // Refresh the editable fields from the saved product whenever edit mode opens.
  const [prevEditing, setPrevEditing] = useState(editing);
  if (editing !== prevEditing) {
    setPrevEditing(editing);
    if (editing) resetForm();
  }

  function cancelEdit() {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onCloseEdit();
  }

  function discardAndClose() {
    setConfirmDiscard(false);
    onCloseEdit();
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
      fd.append("product_id", product.id);
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

  // One-tap stock changes straight from the collapsed card (no edit mode).
  async function quickSetStock(next: number) {
    if (quickSaving) return;
    const value = Math.max(0, Math.min(MAX_STOCK, Math.floor(next)));
    setQuickSaving(true);
    setNotice("");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ stock: value }),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setNotice(err.error || "Could not update stock.");
        return;
      }
      onSaved({ ...product, stock: value });
      setNotice("Stock updated.");
    } catch {
      setNotice("Could not update stock.");
    } finally {
      setQuickSaving(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Product name is required.";
    else if (name.length > 200) next.name = "Must be 200 characters or fewer.";
    if (!brand.trim()) next.brand = "Brand is required.";
    else if (brand.length > 100) next.brand = "Must be 100 characters or fewer.";
    if (!price.trim()) next.price = "Price is required.";
    else if (price.length > 100) next.price = "Must be 100 characters or fewer.";
    if (!dimensions) next.dimensions = "All dimension fields are required.";
    else if (dimensions.length > 100) next.dimensions = "Dimensions must be 100 characters or fewer.";
    if (stockNumber === null) next.stock = "Use a whole number from 0 upward.";
    if (images.length === 0) next.images = "Add at least one product image.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setNotice("");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim(),
          price: price.trim(),
          dimensions,
          images,
          preorder,
          stock: stockNumber,
          // Only send the new column when it actually changed, so normal edits
          // keep working even before migration 008 has been applied.
          ...(assemblyRecommended !== (product.assembly_recommended ?? false)
            ? { assembly_recommended: assemblyRecommended }
            : {}),
        }),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setNotice(err.error || "Could not save changes.");
        return;
      }
      onSaved({
        ...product,
        name: name.trim(),
        brand: brand.trim(),
        price: price.trim(),
        dimensions,
        images,
        preorder,
        assembly_recommended: assemblyRecommended,
        stock: stockNumber as number,
      });
      onCloseEdit();
    } catch {
      setNotice("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setNotice("");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setNotice(err.error || "Could not delete product.");
        setConfirmDelete(false);
        return;
      }
      onDeleted(product.id);
    } catch {
      setNotice("Could not delete product.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <CatalogCardShell
        product={editing ? preview : product}
        showStock
        onThumbnailClick={(index) => setLightboxIndex(index)}
      >
        {editing ? (
          <form id={`edit-panel-${product.id}`} onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`name-${product.id}`} className="text-xs font-semibold text-navy">
                  Product name
                </label>
                <input
                  id={`name-${product.id}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                  className="mt-1 h-10 w-full rounded-lg border-2 border-beige-deep bg-beige px-3 text-sm text-navy outline-none focus:border-navy aria-[invalid=true]:border-red-500"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor={`brand-${product.id}`} className="text-xs font-semibold text-navy">
                  Brand
                </label>
                <input
                  id={`brand-${product.id}`}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  maxLength={100}
                  className="mt-1 h-10 w-full rounded-lg border-2 border-beige-deep bg-beige px-3 text-sm text-navy outline-none focus:border-navy aria-[invalid=true]:border-red-500"
                  aria-invalid={Boolean(errors.brand)}
                />
                {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
              </div>
            </div>

            <div>
              <label htmlFor={`price-${product.id}`} className="text-xs font-semibold text-navy">
                Price
              </label>
              <PriceInput
                id={`price-${product.id}`}
                value={price}
                onChange={setPrice}
                invalid={Boolean(errors.price)}
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div>
              <span className="text-xs font-semibold text-navy">Dimensions (H × W × L)</span>
              <div className="mt-1 grid grid-cols-4 gap-2">
                <input
                  type="number"
                  min="0"
                  value={dimH}
                  onChange={(e) => setDimH(e.target.value)}
                  placeholder="H"
                  aria-label="Height"
                  className="h-10 w-full rounded-lg border-2 border-beige-deep bg-beige px-2 text-center text-sm text-navy outline-none focus:border-navy"
                />
                <input
                  type="number"
                  min="0"
                  value={dimW}
                  onChange={(e) => setDimW(e.target.value)}
                  placeholder="W"
                  aria-label="Width"
                  className="h-10 w-full rounded-lg border-2 border-beige-deep bg-beige px-2 text-center text-sm text-navy outline-none focus:border-navy"
                />
                <input
                  type="number"
                  min="0"
                  value={dimD}
                  onChange={(e) => setDimD(e.target.value)}
                  placeholder="L"
                  aria-label="Length"
                  className="h-10 w-full rounded-lg border-2 border-beige-deep bg-beige px-2 text-center text-sm text-navy outline-none focus:border-navy"
                />
                <select
                  value={dimUnit}
                  onChange={(e) => setDimUnit(e.target.value as DimensionUnit)}
                  aria-label="Dimension unit"
                  className="h-10 w-full rounded-lg border-2 border-beige-deep bg-beige px-1 text-center text-sm font-semibold text-navy outline-none focus:border-navy"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
              {dimensions && <p className="mt-1 text-xs text-navy/40">Preview: {dimensions}</p>}
              {errors.dimensions && <p className="mt-1 text-xs text-red-600">{errors.dimensions}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`stock-${product.id}`} className="text-xs font-semibold text-navy">
                  Stock quantity
                </label>
                <div className="mt-1 flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => setStock(String(Math.max(0, (stockNumber ?? 0) - 1)))}
                    aria-label={`Decrease ${product.name} stock`}
                    className="h-10 w-10 flex-shrink-0 rounded-lg border-2 border-beige-deep bg-beige text-lg font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
                  >
                    −
                  </button>
                  <input
                    id={`stock-${product.id}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    aria-invalid={Boolean(errors.stock)}
                    className="min-w-0 flex-1 rounded-lg border-2 border-beige-deep bg-beige px-3 text-center text-sm font-bold text-navy outline-none focus:border-navy aria-[invalid=true]:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setStock(String((stockNumber ?? 0) + 1))}
                    aria-label={`Increase ${product.name} stock`}
                    className="h-10 w-10 flex-shrink-0 rounded-lg border-2 border-beige-deep bg-beige text-lg font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
                  >
                    +
                  </button>
                </div>
                {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
              </div>

              <div>
                <span className="text-xs font-semibold text-navy">Pre-Order</span>
                <div className="mt-1 flex h-10 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreorder((prev) => !prev)}
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
            </div>

            <div>
              <span className="text-xs font-semibold text-navy">Onsite Assembly Recommended</span>
              <div className="mt-1 flex h-10 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAssemblyRecommended((prev) => !prev)}
                  aria-label="Onsite assembly recommended"
                  aria-pressed={assemblyRecommended}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${
                    assemblyRecommended ? "bg-amber-500" : "bg-navy/20"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                      assemblyRecommended ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-navy">
                  {assemblyRecommended ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-navy">Images</span>
              {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
              <div className="mt-1 flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-beige-deep">
                    <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="64px" />
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
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-beige-deep text-xl text-navy/30 transition-colors hover:border-navy/40 hover:text-navy/50">
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

            {notice && (
              <p role="alert" className="text-xs font-semibold text-red-700">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={saving || uploading}
                className="min-w-[8rem] flex-1 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving || uploading}
                className="min-w-[7rem] flex-1 rounded-xl border-2 border-beige-deep px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-beige disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-w-[7rem] flex-1 rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-navy/60">Quick stock:</span>
              <button
                type="button"
                onClick={() => quickSetStock(product.stock - 1)}
                disabled={quickSaving}
                aria-label={`Decrease ${product.name} stock by 1`}
                className="min-w-[3rem] rounded-lg border-2 border-beige-deep bg-beige px-3 py-2 text-sm font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white disabled:opacity-50"
              >
                −1
              </button>
              <button
                type="button"
                onClick={() => quickSetStock(product.stock + 1)}
                disabled={quickSaving}
                aria-label={`Increase ${product.name} stock by 1`}
                className="min-w-[3rem] rounded-lg border-2 border-beige-deep bg-beige px-3 py-2 text-sm font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white disabled:opacity-50"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => quickSetStock(0)}
                disabled={quickSaving}
                aria-label={`Set ${product.name} stock to 0`}
                className="rounded-lg border-2 border-beige-deep bg-beige px-3 py-2 text-sm font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white disabled:opacity-50"
              >
                Set 0
              </button>
              {quickSaving && <span className="text-xs text-navy/50">Saving…</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="min-w-[7rem] flex-1 rounded-xl border border-navy/20 px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-w-[7rem] flex-1 rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            </div>
            {notice && (
              <p role="alert" className="text-xs font-semibold text-red-700">
                {notice}
              </p>
            )}
          </div>
        )}
      </CatalogCardShell>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${product.id}`}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !deleting) setConfirmDelete(false);
            }}
            className="w-full max-w-md rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl outline-none"
          >
            <h2 id={`delete-title-${product.id}`} className="text-xl font-bold text-navy">
              Delete Product
            </h2>
            <p className="mt-3 text-sm text-navy/70">
              Permanently delete <strong>{product.name}</strong>? This cannot be undone and the
              product cannot be restored.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border-2 border-beige-deep px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-beige disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`discard-title-${product.id}`}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") setConfirmDiscard(false);
            }}
            className="w-full max-w-md rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl outline-none"
          >
            <h2 id={`discard-title-${product.id}`} className="text-xl font-bold text-navy">
              Discard changes?
            </h2>
            <p className="mt-3 text-sm text-navy/70">
              Your unsaved changes to <strong>{product.name}</strong> will be lost.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={discardAndClose}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Discard
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmDiscard(false)}
                className="flex-1 rounded-xl border-2 border-beige-deep px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-beige"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}

      <PhotoLightbox
        images={images}
        open={lightboxIndex !== null}
        startIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        label={`${product.name} photo viewer`}
        altPrefix={product.name}
      />
    </>
  );
}
