"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import type { InventoryProduct } from "@/lib/products";
import { getStockInputError, getPriceSaveError, parseStockValue } from "@/lib/inventory-validation";
import { formatPriceDisplay } from "@/lib/format";
import PriceInput from "./PriceInput";

function initialDrafts(products: InventoryProduct[]) {
  return Object.fromEntries(products.map((product) => [product.id, String(product.stock)]));
}

function initialPriceDrafts(products: InventoryProduct[]) {
  return Object.fromEntries(products.map((product) => [product.id, String(product.price)]));
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

        <p role="status" aria-live="polite" className="mt-8 min-h-6 text-sm font-semibold text-emerald-800">
          {notice}
        </p>

        <section className="mt-2 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Cabinet inventory">
          {products.map((product) => {
            const error = errors[product.id];
            const isSaving = savingId === product.id;
            const isSaved = savedId === product.id;
            const inStock = product.stock > 0;

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border-2 border-beige-deep bg-beige-soft shadow-xl shadow-navy/15 transition-all duration-300 hover:-translate-y-1 hover:border-navy/35 hover:shadow-2xl hover:shadow-navy/20"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-beige">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span
                    className={`absolute right-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${
                      inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-600" : "bg-red-600"}`} />
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <h2 className="min-h-14 text-lg font-bold leading-snug text-navy">{product.name}</h2>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/40">Item #{product.itemNumber}</p>
                  <div className="mt-4 flex items-end justify-between gap-4 border-b border-beige-deep/70 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy/50">Current stock</p>
                      <p className="mt-1 text-3xl font-black text-navy">{product.stock}</p>
                    </div>
                    <p className="text-right text-sm font-medium text-navy/60">{product.dimensions}</p>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-navy/70">
                    Price: <span className="text-navy-light">{formatPriceDisplay(product.price)}</span>
                  </p>

                  <form onSubmit={(event) => saveStock(event, product.id)} className="mt-5">
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
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
