"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { InventoryProduct } from "@/lib/products";
import type { CatalogProduct } from "@/lib/catalog";
import { getStockInputError, getPriceSaveError, parseStockValue } from "@/lib/inventory-validation";
import { formatPriceDisplay } from "@/lib/format";
import { assignDisplayNumbers } from "@/lib/item-number";
import PriceInput from "./PriceInput";
import ProductForm, { type ProductFormData } from "./ProductForm";
import CatalogCardShell from "@/components/CatalogCardShell";
import PhotoLightbox from "@/components/PhotoLightbox";

type ProductFilter = "all" | "active" | "hidden";

const FILTERS: Array<{ key: ProductFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "hidden", label: "Hidden" },
];

function initialDrafts(products: InventoryProduct[]) {
  return Object.fromEntries(products.map((product) => [product.id, String(product.stock)]));
}

function initialPriceDrafts(products: InventoryProduct[]) {
  return Object.fromEntries(products.map((product) => [product.id, String(product.price)]));
}

function toCatalogProduct(product: InventoryProduct): CatalogProduct {
  return {
    id: product.id,
    item_number: product.itemNumber,
    brand: product.brand,
    name: product.name,
    price: product.price,
    dimensions: product.dimensions,
    images: product.images,
    preorder: product.preorder ?? false,
    active: product.active ?? true,
    created_at: "",
    updated_at: "",
  };
}

export default function AdminDashboard({
  initialProducts,
  username,
}: {
  initialProducts: InventoryProduct[];
  username: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [drafts, setDrafts] = useState(() => initialDrafts(initialProducts));
  const [priceDrafts, setPriceDrafts] = useState(() => initialPriceDrafts(initialProducts));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");

  // Product management state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [hidingProduct, setHidingProduct] = useState<CatalogProduct | null>(null);

  // Photo lightbox state
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
    label: string;
    altPrefix: string;
  } | null>(null);

  const orderedProducts = useMemo(
    () => assignDisplayNumbers([...products].sort((a, b) => a.itemNumber - b.itemNumber)),
    [products]
  );

  const visibleProducts = useMemo(() => {
    if (filter === "active") return orderedProducts.filter((product) => product.active !== false);
    if (filter === "hidden") return orderedProducts.filter((product) => product.active === false);
    return orderedProducts;
  }, [orderedProducts, filter]);

  const totalStock = products.reduce((total, product) => total + product.stock, 0);
  const inStockCount = products.filter((product) => product.stock > 0).length;

  function changeDraft(productId: string, value: string) {
    const inputError = getStockInputError(value);
    if (value !== "" && inputError) {
      setErrors((current) => ({ ...current, [productId]: inputError }));
      return;
    }

    setDrafts((current) => ({ ...current, [productId]: value }));
    setErrors((current) => ({
      ...current,
      [productId]: value === "" ? "Enter a stock quantity." : "",
    }));
    setSavedId(null);
    setNotice("");
  }

  function adjustDraft(productId: string, amount: number) {
    const current = parseStockValue(drafts[productId]) ?? 0;
    const next = Math.max(0, current + amount);
    changeDraft(productId, String(next));
  }

  function changePrice(productId: string, value: string) {
    setPriceDrafts((current) => ({ ...current, [productId]: value }));
    setErrors((current) => ({
      ...current,
      [productId]: "",
    }));
    setSavedId(null);
    setNotice("");
  }

  async function saveStock(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    const draft = drafts[productId] ?? "";
    const stockError = getStockInputError(draft);
    if (stockError) {
      setErrors((current) => ({ ...current, [productId]: stockError }));
      return;
    }

    const stock = parseStockValue(draft);
    if (stock === null) {
      setErrors((current) => ({
        ...current,
        [productId]: "Use a valid whole-number stock quantity.",
      }));
      return;
    }

    const price = priceDrafts[productId] ?? "";
    const priceError = getPriceSaveError(price);
    if (priceError) {
      setErrors((current) => ({
        ...current,
        [productId]: priceError,
      }));
      return;
    }

    setSavingId(productId);
    setSavedId(null);
    setNotice("");

    try {
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ productId, stock, price }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: unknown; product?: InventoryProduct };

      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Inventory could not be saved.");
      }

      const updated = result.product as InventoryProduct | undefined;
      setProducts((current) =>
        current.map((p) => (p.id === productId ? { ...p, stock, price: updated?.price ?? p.price } : p))
      );
      setDrafts((current) => ({ ...current, [productId]: String(stock) }));
      setErrors((current) => ({ ...current, [productId]: "" }));
      setSavedId(productId);
      setNotice("Inventory saved. The public product listing is now up to date.");
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [productId]: error instanceof Error ? error.message : "Inventory could not be saved.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  async function handleAddProduct(data: ProductFormData) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(data),
    });
    if (res.status === 401) { window.location.assign("/admin/login"); return; }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || "Unable to create product.");
    }
    const result = (await res.json()) as { product?: CatalogProduct };
    if (result.product) {
      const newProduct: InventoryProduct = {
        id: result.product.id,
        itemNumber: result.product.item_number,
        brand: result.product.brand,
        name: result.product.name,
        price: result.product.price,
        dimensions: result.product.dimensions,
        images: result.product.images,
        preorder: result.product.preorder || undefined,
        active: true,
        stock: data.stock,
      };
      setProducts((prev) => [...prev, newProduct]);
      setDrafts((prev) => ({ ...prev, [newProduct.id]: String(data.stock) }));
      setPriceDrafts((prev) => ({ ...prev, [newProduct.id]: data.price }));
    }
    setShowAddForm(false);
    setNotice("Product created. The public listing is now up to date.");
  }

  async function handleEditProduct(data: ProductFormData) {
    if (!editingProduct) return;
    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(data),
    });
    if (res.status === 401) { window.location.assign("/admin/login"); return; }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || "Unable to update product.");
    }
    // Also update stock/price via inventory API if changed
    const currentProduct = products.find((p) => p.id === editingProduct.id);
    if (currentProduct && (data.stock !== currentProduct.stock || data.price !== currentProduct.price)) {
      const inventoryRes = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ productId: editingProduct.id, stock: data.stock, price: data.price }),
      });
      if (inventoryRes.status === 401) { window.location.assign("/admin/login"); return; }
      if (!inventoryRes.ok) {
        const err = (await inventoryRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Unable to update inventory.");
      }
    }
    const result = (await res.json()) as { product?: CatalogProduct };
    if (result.product) {
      setProducts((prev) => prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, name: result.product!.name, brand: result.product!.brand, price: result.product!.price, dimensions: result.product!.dimensions, images: result.product!.images, preorder: result.product!.preorder || undefined, stock: data.stock }
          : p
      ));
      setDrafts((prev) => ({ ...prev, [editingProduct.id]: String(data.stock) }));
      setPriceDrafts((prev) => ({ ...prev, [editingProduct.id]: data.price }));
    }
    setEditingProduct(null);
    setNotice("Product updated. The public listing is now up to date.");
  }

  async function handleHideProduct() {
    if (!hidingProduct) return;
    const productId = hidingProduct.id;
    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.status === 401) { window.location.assign("/admin/login"); return; }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      setNotice(err.error || "Unable to hide product.");
    } else {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, active: false } : p)));
      setNotice("Product hidden from the public catalog.");
    }
    setHidingProduct(null);
  }

  async function handleRestoreProduct(productId: string) {
    setNotice("");
    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ active: true }),
    });
    if (res.status === 401) { window.location.assign("/admin/login"); return; }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      setNotice(err.error || "Unable to restore product.");
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, active: true } : p)));
    setNotice("Product restored to the public catalog.");
  }

  return (
    <main className="min-h-screen bg-beige text-navy">
      <header className="border-b-2 border-beige-deep bg-beige-soft/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/logo/onebyte-logo.jpg"
              alt="OneByte Steel Cabinets logo"
              width={48}
              height={48}
              className="h-10 w-10 rounded-xl shadow-lg shadow-navy/20 sm:h-12 sm:w-12"
            />
            <span className="truncate text-base font-bold text-navy sm:text-xl">
              OneByte <span className="text-navy-light">Inventory</span>
            </span>
          </Link>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="hidden rounded-xl border border-navy/20 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white sm:block"
            >
              View website
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-navy/60">
              Admin dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy sm:text-6xl">
              Cabinet inventory
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy/65 sm:text-lg">
              Update quantities as stock moves. Every saved change flows to the public product cards.
            </p>
            <p className="mt-3 text-sm font-medium text-navy/50">Signed in as {username}</p>
          </div>
          <div className="rounded-2xl border-2 border-beige-deep bg-beige-soft px-5 py-4 text-sm text-navy/70 shadow-lg shadow-navy/10">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-600" />
            Live inventory sync enabled
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Inventory summary">
          <div className="rounded-2xl border-2 border-beige-deep bg-beige-soft p-5 shadow-lg shadow-navy/10">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/55">Cabinet types</p>
            <p className="mt-2 text-3xl font-black text-navy">{products.length}</p>
          </div>
          <div className="rounded-2xl border-2 border-beige-deep bg-beige-soft p-5 shadow-lg shadow-navy/10">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/55">Total units</p>
            <p className="mt-2 text-3xl font-black text-navy">{totalStock.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border-2 border-beige-deep bg-beige-soft p-5 shadow-lg shadow-navy/10">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/55">In stock</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {inStockCount} <span className="text-base font-semibold text-navy/50">of {products.length}</span>
            </p>
          </div>
        </section>

        {/* Product Management Section */}
        <section className="mt-10" aria-label="Product management">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Product Management</h2>
              <p className="mt-1 text-sm text-navy/60">Add, edit, hide, or restore products from the catalog.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
            >
              + Add Product
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter products">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                aria-pressed={filter === option.key}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
                  filter === option.key
                    ? "border-navy bg-navy text-white"
                    : "border-beige-deep bg-beige-soft text-navy hover:border-navy/40"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <p role="status" aria-live="polite" className="mt-6 min-h-6 text-sm font-semibold text-emerald-800">
          {notice}
        </p>

        <section className="mt-2 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Cabinet inventory">
          {visibleProducts.length === 0 && (
            <p className="col-span-full rounded-2xl border-2 border-dashed border-beige-deep bg-beige-soft px-6 py-10 text-center text-sm font-medium text-navy/50">
              No products match this filter.
            </p>
          )}

          {visibleProducts.map((product) => {
            const error = errors[product.id];
            const isSaving = savingId === product.id;
            const isSaved = savedId === product.id;
            const hidden = product.active === false;

            return (
              <CatalogCardShell
                key={product.id}
                product={product}
                hidden={hidden}
                onThumbnailClick={(index) =>
                  setLightbox({
                    images: product.images,
                    index,
                    label: `${product.name} photo viewer`,
                    altPrefix: product.name,
                  })
                }
              >
                <div className="w-full">
                  <div className="flex items-end justify-between gap-3 border-b border-beige-deep/70 pb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy/50">Current stock</p>
                      <p className="mt-0.5 text-2xl font-black text-navy">{product.stock}</p>
                    </div>
                    <p className="text-sm font-semibold text-navy/70">{formatPriceDisplay(product.price)}</p>
                  </div>

                  <form onSubmit={(event) => saveStock(event, product.id)} className="mt-4">
                    <label htmlFor={`stock-${product.id}`} className="text-sm font-semibold text-navy">
                      Set quantity
                    </label>
                    <div className="mt-2 flex items-stretch gap-2">
                      <button
                        type="button"
                        onClick={() => adjustDraft(product.id, -1)}
                        aria-label={`Decrease ${product.name} stock`}
                        className="h-12 w-12 flex-shrink-0 rounded-xl border-2 border-beige-deep bg-beige text-xl font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white active:scale-95"
                      >
                        −
                      </button>
                      <input
                        id={`stock-${product.id}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={drafts[product.id] ?? ""}
                        onChange={(event) => changeDraft(product.id, event.target.value)}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? `stock-error-${product.id}` : undefined}
                        className="min-w-0 flex-1 rounded-xl border-2 border-beige-deep bg-beige px-3 text-center text-lg font-bold text-navy outline-none transition-colors focus:border-navy aria-[invalid=true]:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => adjustDraft(product.id, 1)}
                        aria-label={`Increase ${product.name} stock`}
                        className="h-12 w-12 flex-shrink-0 rounded-xl border-2 border-beige-deep bg-beige text-xl font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-4">
                      <label htmlFor={`price-${product.id}`} className="text-sm font-semibold text-navy">
                        Set price
                      </label>
                      <PriceInput
                        id={`price-${product.id}`}
                        value={priceDrafts[product.id] ?? ""}
                        onChange={(value) => changePrice(product.id, value)}
                        invalid={Boolean(error)}
                        describedBy={error ? `stock-error-${product.id}` : undefined}
                      />
                    </div>

                    {error && (
                      <p id={`stock-error-${product.id}`} className="mt-2 text-sm font-medium text-red-700">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-navy-light hover:shadow-lg hover:shadow-navy/20 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : isSaved ? "Saved" : "Save changes"}
                    </button>
                  </form>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(toCatalogProduct(product))}
                      className="flex-1 rounded-xl border border-navy/20 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
                    >
                      Edit
                    </button>
                    {hidden ? (
                      <button
                        type="button"
                        onClick={() => handleRestoreProduct(product.id)}
                        className="flex-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setHidingProduct(toCatalogProduct(product))}
                        className="flex-1 rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                      >
                        Hide
                      </button>
                    )}
                  </div>
                </div>
              </CatalogCardShell>
            );
          })}
        </section>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl"
          >
            <h2 id="add-product-title" className="mb-4 text-xl font-bold text-navy">Add New Product</h2>
            <ProductForm mode="add" onSubmit={handleAddProduct} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl"
          >
            <h2 id="edit-product-title" className="mb-4 text-xl font-bold text-navy">Edit Product</h2>
            <ProductForm
              mode="edit"
              initial={{ ...editingProduct, stock: products.find((p) => p.id === editingProduct.id)?.stock ?? 0 }}
              onSubmit={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      {/* Hide Confirmation Modal */}
      {hidingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hide-product-title"
            className="w-full max-w-md rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl"
          >
            <h2 id="hide-product-title" className="text-xl font-bold text-navy">Hide Product</h2>
            <p className="mt-3 text-sm text-navy/70">
              Are you sure you want to hide <strong>{hidingProduct.name}</strong>? It will no longer appear in the public catalog. No data is deleted and you can restore it later.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleHideProduct}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Yes, hide
              </button>
              <button
                type="button"
                onClick={() => setHidingProduct(null)}
                className="flex-1 rounded-xl border-2 border-beige-deep px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-beige"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PhotoLightbox
        images={lightbox?.images ?? []}
        open={lightbox !== null}
        startIndex={lightbox?.index ?? 0}
        onClose={() => setLightbox(null)}
        label={lightbox?.label ?? "Photo viewer"}
        altPrefix={lightbox?.altPrefix ?? "Photo"}
      />
    </main>
  );
}
