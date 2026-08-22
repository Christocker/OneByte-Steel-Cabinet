import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_CATALOG_FILE = path.join(process.cwd(), "data", "catalog.json");

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

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = secretKey || legacyServiceRoleKey;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new CatalogError(
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
    throw new CatalogError("SUPABASE_URL is not a valid URL.");
  }
}

function headers(config: SupabaseConfig, extra?: Record<string, string>): HeadersInit {
  const h: Record<string, string> = { apikey: config.key, ...extra };
  if (config.authorization) h.Authorization = config.authorization;
  return h;
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
    preorder: Boolean(r.preorder),
    active: Boolean(r.active ?? true),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

async function readSupabaseAll(config: SupabaseConfig): Promise<CatalogProduct[]> {
  const res = await fetch(
    `${config.baseUrl}/rest/v1/cabinet_products?select=*&order=item_number.asc`,
    { headers: headers(config), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Catalog fetch failed (${res.status}).`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error("Invalid catalog response.");
  return data.map(parseRow);
}

async function readSupabaseActive(config: SupabaseConfig): Promise<CatalogProduct[]> {
  const res = await fetch(
    `${config.baseUrl}/rest/v1/cabinet_products?select=*&active=eq.true&order=item_number.asc`,
    { headers: headers(config), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Catalog fetch failed (${res.status}).`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error("Invalid catalog response.");
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
  if (!res.ok) throw new Error(`Catalog fetch failed (${res.status}).`);
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
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Catalog write failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// --- Local fallback (for development without Supabase) ---

async function readLocalAll(): Promise<CatalogProduct[]> {
  try {
    const data = await readFile(LOCAL_CATALOG_FILE, "utf8");
    return JSON.parse(data) as CatalogProduct[];
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
  return config ? readSupabaseActive(config) : (await readLocalAll()).filter((p) => p.active);
}

export async function getAllProducts(): Promise<CatalogProduct[]> {
  const config = getSupabaseConfig();
  return config ? readSupabaseAll(config) : readLocalAll();
}

export async function getProductById(id: string): Promise<CatalogProduct | null> {
  const config = getSupabaseConfig();
  if (config) return readSupabaseOne(config, id);
  const all = await readLocalAll();
  return all.find((p) => p.id === id) ?? null;
}

export async function getNextItemNumber(): Promise<number> {
  const all = await getAllProducts();
  if (all.length === 0) return 1;
  return Math.max(...all.map((p) => p.item_number)) + 1;
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
};

export type UpdateProductInput = {
  name?: string;
  brand?: string;
  price?: string;
  dimensions?: string;
  images?: string[];
  preorder?: boolean;
  active?: boolean;
};

export async function createProduct(input: CreateProductInput): Promise<CatalogProduct> {
  const itemNumber = await getNextItemNumber();
  const now = new Date().toISOString();
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

  const config = getSupabaseConfig();
  if (config) {
    await writeSupabase(config, "POST", "cabinet_products?on_conflict=id", product as unknown as Record<string, unknown>);
    // Also create inventory row
    await writeSupabase(
      config,
      "POST",
      "cabinet_inventory?on_conflict=product_id",
      { product_id: input.id, stock: input.stock, updated_at: now }
    );
  } else {
    const all = await readLocalAll();
    all.push(product);
    await writeLocal(all);
  }

  return product;
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
  if (input.active !== undefined) updates.active = input.active;

  const config = getSupabaseConfig();
  if (config) {
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

export async function deleteProduct(id: string): Promise<void> {
  return updateProduct(id, { active: false });
}
