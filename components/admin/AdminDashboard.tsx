"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { InventoryProduct } from "@/lib/products";
import { assignDisplayNumbers } from "@/lib/item-number";
import AdminProductCard from "./AdminProductCard";
import ProductForm, { type ProductFormData } from "./ProductForm";

export default function AdminDashboard({
  initialProducts,
  username,
}: {
  initialProducts: InventoryProduct[];
  username: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [notice, setNotice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [exporting, setExporting] = useState(false);
  // Only one card can be in edit mode at a time.
  const [editingId, setEditingId] = useState<string | null>(null);
  const dirtyRef = useRef<Record<string, boolean>>({});
  const handleDirtyChange = useCallback((id: string, dirty: boolean) => {
    dirtyRef.current[id] = dirty;
  }, []);

  function requestEdit(id: string) {
    const current = editingId;
    if (current && current !== id && dirtyRef.current[current]) {
      if (!window.confirm("Discard unsaved changes to the product you are editing?")) {
        return;
      }
    }
    setEditingId(id);
  }

  // Same ordering + numbering as the storefront, so item numbers always match.
  const orderedProducts = useMemo(
    () => assignDisplayNumbers([...products].sort((a, b) => a.itemNumber - b.itemNumber)),
    [products]
  );

  const totalStock = products.reduce((total, product) => total + product.stock, 0);
  const inStockCount = products.filter((product) => product.stock > 0).length;

  function goToLogin() {
    window.location.assign("/admin/login");
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      goToLogin();
    }
  }

  async function handleAddProduct(data: ProductFormData) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      goToLogin();
      return;
    }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || "Unable to create product.");
    }
    const result = (await res.json()) as {
      product?: {
        id: string;
        item_number: number;
        brand: string;
        name: string;
        price: string;
        dimensions: string;
        images: string[];
        preorder: boolean;
        assembly_recommended?: boolean;
      };
    };
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
        assembly_recommended: result.product.assembly_recommended || undefined,
        stock: data.stock,
      };
      setProducts((prev) => [...prev, newProduct]);
    }
    setShowAddForm(false);
    setNotice("Product created. The public listing is now up to date.");
  }

  function handleSaved(updated: InventoryProduct) {
    setProducts((prev) => prev.map((product) => (product.id === updated.id ? updated : product)));
    setNotice("Changes saved. The public listing is now up to date.");
  }

  function handleDeleted(id: string) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    setEditingId((current) => (current === id ? null : current));
    setNotice("Product permanently deleted.");
  }

  async function handleExport() {
    if (orderedProducts.length === 0) {
      setNotice("Add at least one product before exporting.");
      return;
    }
    setExporting(true);
    setNotice("");
    try {
      const { renderCatalogJpeg } = await import("@/lib/catalog-image");
      const blob = await renderCatalogJpeg(
        orderedProducts,
        "Dasmariñas, Cavite · +63 918 381 1094 · Facebook: OneByte Steel Cabinets"
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.href = url;
      link.download = `onebyte-catalog-${stamp}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Catalog image downloaded.");
    } catch {
      setNotice("Could not generate the catalog image.");
    } finally {
      setExporting(false);
    }
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
              Edit any cabinet directly on its card, then Save changes. Everything you save flows to
              the public product cards.
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

        <section className="mt-10" aria-label="Product management">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Product Management</h2>
              <p className="mt-1 text-sm text-navy/60">Edit each card and save, or delete a product permanently.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-navy/25 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {exporting ? "Generating..." : "Download catalog (JPEG)"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
              >
                + Add Product
              </button>
            </div>
          </div>
        </section>

        <p role="status" aria-live="polite" className="mt-6 min-h-6 text-sm font-semibold text-emerald-800">
          {notice}
        </p>

        <section className="mt-2 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Cabinet inventory">
          {orderedProducts.length === 0 && (
            <p className="col-span-full rounded-2xl border-2 border-dashed border-beige-deep bg-beige-soft px-6 py-10 text-center text-sm font-medium text-navy/50">
              No products yet. Use Add Product to create one.
            </p>
          )}

          {orderedProducts.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              editing={editingId === product.id}
              onEdit={() => requestEdit(product.id)}
              onCloseEdit={() =>
                setEditingId((current) => (current === product.id ? null : current))
              }
              onDirtyChange={(dirty) => handleDirtyChange(product.id, dirty)}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
              onUnauthorized={goToLogin}
            />
          ))}
        </section>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl"
          >
            <h2 id="add-product-title" className="mb-4 text-xl font-bold text-navy">Add New Product</h2>
            <ProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
