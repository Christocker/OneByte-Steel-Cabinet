import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { nextItemNumberFrom } from "./item-number";

const LOCAL_CATALOG_FILE = path.join(process.cwd(), "data", "catalog.json");
const LOCAL_INVENTORY_FILE = path.join(process.cwd(), "data", "inventory.json");

export type CatalogProduct = {
  id: string;
  item_number: number;
  brand: string;
  name: string;
  price: string;
  dimensions: string;
  images: string[];
  preorder: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type SupabaseConfig = {
  baseUrl: string;
  key: string;
  authorization?: string;
};

export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogError";
  }
}

export class CatalogConfigurationError extends CatalogError {
  constructor(message: string) {
    super(message);
    this.name = "CatalogConfigurationError";
  }
}

export class DuplicateKeyError extends Error {
  readonly detail: string;
  constructor(detail: string) {
    super("duplicate key");
    this.name = "DuplicateKeyError";
    this.detail = detail;
  }
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = secretKey || legacyServiceRoleKey;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new CatalogConfigurationError(
        "SUPABASE_URL and SUPABASE_SECRET_KEY must be configured in production."
      );
    }
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && process.env.NODE_ENV === "production") {
      throw new Error("Supabase URL must use HTTPS.");
    }
    return {
      baseUrl: url.replace(/\/+$/, ""),
      key,
      ...(secretKey ? {} : { authorization: `Bearer ${legacyServiceRoleKey}` }),
    };
  } catch {
    throw new CatalogConfigurationError("SUPABASE_URL is not a valid URL.");
  }
}

function headers(config: SupabaseConfig, extra?: Record<string, string>): HeadersInit {
  const h: Record<string, string> = { apikey: config.key, ...extra };
  if (config.authorization) h.Authorization = config.authorization;
  return h;
}

let tableEnsured = false;

async function ensureTable(config: SupabaseConfig): Promise<void> {
  if (tableEnsured) return;
  // Try a simple query to check if the table exists
  try {
    const res = await fetch(
      `${config.baseUrl}/rest/v1/cabinet_products?select=id&limit=1`,
      { headers: headers(config), cache: "no-store" }
    );
    if (res.ok) { tableEnsured = true; return; }
  } catch { /* table missing */ }

  // Table doesn't exist — create it via Supabase client SQL
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(config.baseUrl, config.key);

  const sql = `
CREATE TABLE IF NOT EXISTS public.cabinet_products (
  id text PRIMARY KEY, item_number integer NOT NULL UNIQUE,
  brand text NOT NULL, name text NOT NULL, price text NOT NULL,
  dimensions text NOT NULL, images text[] NOT NULL DEFAULT '{}',
  preorder boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public.cabinet_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cabinet_products FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cabinet_products TO service_role;
`;

  const { error } = await supabase.rpc("exec_sql", { query: sql });
  if (error) throw new CatalogError(
    "Could not auto-create the product table. Please run the migration manually in your Supabase SQL Editor."
  );

  tableEnsured = true;
}

function parseRow(row: unknown): CatalogProduct {
  if (!row || typeof row !== "object") throw new Error("Invalid catalog row.");
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    item_number: Number(r.item_number ?? 0),
    brand: String(r.brand ?? ""),
    name: String(r.name ?? ""),
    price: String(r.price ?? "0"),
    dimensions: String(r.dimensions ?? ""),
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    preorder: r.preorder === true || r.preorder === "true",
    active: r.active === true || r.active === "true",
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

async function readSupabaseAll(config: SupabaseConfig): Promise<CatalogProduct[]> {
  await ensureTable(config);
  const res = await fetch(
    `${config.baseUrl}/rest/v1/cabinet_products?select=*&order=item_number.asc`,
    { headers: headers(config), cache: "no-store" }
  );
  if (!res.ok) {
    throw new CatalogError(`Catalog request failed with status ${res.status}.`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new CatalogError("Catalog storage returned an invalid response.");
  }
  return data.map(parseRow);
}

async function readSupabaseActive(config: SupabaseConfig): Promise<CatalogProduct[]> {
  await ensureTable(config);
  const res = await fetch(
    `${config.baseUrl}/rest/v1/cabinet_products?select=*&active=eq.true&order=item_number.asc`,
    { headers: headers(config), cache: "no-store" }
  );
  if (!res.ok) {
    throw new CatalogError(`Catalog request failed with status ${res.status}.`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new CatalogError("Catalog storage returned an invalid response.");
  }
  return data.map(parseRow);
}

async function readSupabaseOne(
  config: SupabaseConfig,
  id: string
): Promise<CatalogProduct | null> {
  const res = await fetch(
    `${config.baseUrl}/rest/v1/cabinet_products?select=*&id=eq.${encodeURIComponent(id)}`,
    { headers: headers(config), cache: "no-store" }
  );
  if (!res.ok) {
    throw new CatalogError(`Catalog request failed with status ${res.status}.`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data) || data.length === 0) return null;
  return parseRow(data[0]);
}

async function writeSupabase(
  config: SupabaseConfig,
  method: string,
  pathSuffix: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const extra: Record<string, string> = { "Content-Type": "application/json" };
  if (method === "POST") extra.Prefer = "return=representation";
  const res = await fetch(`${config.baseUrl}/rest/v1/${pathSuffix}`, {
    method,
    headers: headers(config, extra),
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 204) return null;
  if (res.status === 409) {
    const detail = await res.text().catch(() => "");
    throw new DuplicateKeyError(detail);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Catalog write failed (${res.status}): ${text}`);
  }
  return res.json();
}

// --- Local fallback (for development without Supabase) ---

async function readLocalAll(): Promise<CatalogProduct[]> {
  try {
    const data = await readFile(LOCAL_CATALOG_FILE, "utf8");
    const parsed = JSON.parse(data) as CatalogProduct[];
    return parsed.sort((a, b) => a.item_number - b.item_number);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") return [];
    throw new Error("Local catalog could not be read.");
  }
}

async function writeLocal(products: CatalogProduct[]): Promise<void> {
  const tmp = `${LOCAL_CATALOG_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(products, null, 2) + "\n", "utf8");
  await rename(tmp, LOCAL_CATALOG_FILE);
}

// --- Public API ---

export async function getActiveProducts(): Promise<CatalogProduct[]> {
  const config = getSupabaseConfig();
  // With Supabase configured, read failures must surface instead of silently
  // serving stale local JSON. The local file is a development-only fallback.
  if (config) return readSupabaseActive(config);
  const all = await readLocalAll();
  return all.filter((p) => p.active);
}

export async function getAllProducts(): Promise<CatalogProduct[]> {
  const config = getSupabaseConfig();
  if (config) return readSupabaseAll(config);
  return readLocalAll();
}

export async function getProductById(id: string): Promise<CatalogProduct | null> {
  const config = getSupabaseConfig();
  if (config) return readSupabaseOne(config, id);
  const all = await readLocalAll();
  return all.find((p) => p.id === id) ?? null;
}

export async function getNextItemNumber(): Promise<number> {
  const config = getSupabaseConfig();
  if (config) {
    await ensureTable(config);
    // Count every row so a deleted product's stored number is never accidentally
    // reused while its removal is still in flight.
    const res = await fetch(
      `${config.baseUrl}/rest/v1/cabinet_products?select=item_number&order=item_number.desc&limit=1`,
      { headers: headers(config), cache: "no-store" }
    );
    if (!res.ok) {
      throw new CatalogError(`Catalog request failed with status ${res.status}.`);
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || data.length === 0) return 1;
    return nextItemNumberFrom(data as Array<{ item_number: number }>);
  }
  const all = await readLocalAll();
  if (all.length === 0) return 1;
  return nextItemNumberFrom(all);
}

export type CreateProductInput = {
  id: string;
  name: string;
  brand: string;
  price: string;
  dimensions: string;
  images: string[];
  stock: number;
  preorder: boolean;
  nextItemNumber?: number;
};

export type UpdateProductInput = {
  name?: string;
  brand?: string;
  price?: string;
  dimensions?: string;
  images?: string[];
  preorder?: boolean;
};

export async function createProduct(input: CreateProductInput): Promise<CatalogProduct> {
  const now = new Date().toISOString();

  const config = getSupabaseConfig();
  if (config) {
    // Verify table exists and is writable before proceeding
    await ensureTable(config);

    // Try to insert with increasing item numbers on conflict
    // Use client-provided item number, or query DB as fallback
    let itemNumber = input.nextItemNumber ?? (await getNextItemNumber());
    let saved = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const product: CatalogProduct = {
        id: input.id,
        item_number: itemNumber,
        brand: input.brand,
        name: input.name,
        price: input.price,
        dimensions: input.dimensions,
        images: input.images,
        preorder: input.preorder,
        active: true,
        created_at: now,
        updated_at: now,
      };
      try {
        await writeSupabase(config, "POST", "cabinet_products", product as unknown as Record<string, unknown>);
        saved = true;
        break;
      } catch (error) {
        // Retry only when the item_number unique constraint collided. Other 409s
        // (for example a duplicate product id) and all other failures surface.
        if (
          error instanceof DuplicateKeyError &&
          (error.detail === "" || error.detail.includes("item_number"))
        ) {
          itemNumber++;
          continue;
        }
        throw error;
      }
    }

    if (!saved) {
      throw new CatalogError("Could not create product after multiple attempts. Please try a different name.");
    }

    // Also create inventory row
    await writeSupabase(
      config,
      "POST",
      "cabinet_inventory?on_conflict=product_id",
      { product_id: input.id, stock: input.stock, updated_at: now }
    );

    return (await getProductById(input.id)) ?? {
      id: input.id,
      item_number: itemNumber,
      brand: input.brand,
      name: input.name,
      price: input.price,
      dimensions: input.dimensions,
      images: input.images,
      preorder: input.preorder,
      active: true,
      created_at: now,
      updated_at: now,
    };
  } else {
    const all = await readLocalAll();
    const itemNumber = all.length > 0 ? nextItemNumberFrom(all) : 1;
    const product: CatalogProduct = {
      id: input.id,
      item_number: itemNumber,
      brand: input.brand,
      name: input.name,
      price: input.price,
      dimensions: input.dimensions,
      images: input.images,
      preorder: input.preorder,
      active: true,
      created_at: now,
      updated_at: now,
    };
    all.push(product);
    await writeLocal(all);
    return product;
  }
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<CatalogProduct> {
  const existing = await getProductById(id);
  if (!existing) throw new CatalogError("Product not found.");

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.brand !== undefined) updates.brand = input.brand;
  if (input.price !== undefined) updates.price = input.price;
  if (input.dimensions !== undefined) updates.dimensions = input.dimensions;
  if (input.images !== undefined) updates.images = input.images;
  if (input.preorder !== undefined) updates.preorder = input.preorder;

  const config = getSupabaseConfig();
  if (config) {
    await ensureTable(config);
    await writeSupabase(
      config,
      "PATCH",
      `cabinet_products?id=eq.${encodeURIComponent(id)}`,
      updates
    );
  } else {
    const all = await readLocalAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates } as CatalogProduct;
      await writeLocal(all);
    }
  }

  return (await getProductById(id))!;
}

async function pruneLocalInventory(productId: string): Promise<void> {
  try {
    const raw = await readFile(LOCAL_INVENTORY_FILE, "utf8");
    const rows = JSON.parse(raw) as Array<{ product_id?: unknown }>;
    if (!Array.isArray(rows)) return;
    const filtered = rows.filter((row) => row?.product_id !== productId);
    if (filtered.length === rows.length) return;
    const tmp = `${LOCAL_INVENTORY_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, `${JSON.stringify(filtered, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(tmp, LOCAL_INVENTORY_FILE);
  } catch {
    // No local inventory file to prune (production uses Supabase).
  }
}

// Permanent delete: removes the product row and its inventory row. There is no
// soft-hide path and no restore.
export async function deleteProduct(id: string): Promise<void> {
  const config = getSupabaseConfig();
  if (config) {
    await ensureTable(config);
    const existing = await getProductById(id);
    if (!existing) throw new CatalogError("Product not found.");
    // Inventory first, then the product, so a partial failure never leaves the
    // product gone but its stock row orphaned by our own action.
    await writeSupabase(
      config,
      "DELETE",
      `cabinet_inventory?product_id=eq.${encodeURIComponent(id)}`
    );
    await writeSupabase(
      config,
      "DELETE",
      `cabinet_products?id=eq.${encodeURIComponent(id)}`
    );
    return;
  }

  const all = await readLocalAll();
  const next = all.filter((product) => product.id !== id);
  if (next.length === all.length) throw new CatalogError("Product not found.");
  await writeLocal(next);
  await pruneLocalInventory(id);
}
