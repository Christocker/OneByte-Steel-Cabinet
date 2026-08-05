import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { products, type InventoryProduct } from "./products";
import { parseStockValue } from "./inventory-validation";

const LOCAL_INVENTORY_FILE = path.join(process.cwd(), "data", "inventory.json");

type StoredInventoryRow = {
  product_id: string;
  stock: number;
  price?: string;
  updated_at?: string;
};

type SupabaseConfig = {
  baseUrl: string;
  key: string;
  authorization?: string;
};

export class InventoryConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryConfigurationError";
  }
}

export class InventoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryValidationError";
  }
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = secretKey || legacyServiceRoleKey;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new InventoryConfigurationError(
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
    throw new InventoryConfigurationError("SUPABASE_URL is not a valid URL.");
  }
}

function parseStoredRows(value: unknown): StoredInventoryRow[] {
  if (!Array.isArray(value)) {
    throw new Error("Inventory storage returned an invalid response.");
  }

  return value.map((row) => {
    if (!row || typeof row !== "object") {
      throw new Error("Inventory storage returned an invalid row.");
    }
    const candidate = row as { product_id?: unknown; stock?: unknown; price?: unknown; updated_at?: unknown };
    const stock = parseStockValue(candidate.stock);
    if (
      typeof candidate.product_id !== "string" ||
      candidate.product_id.length === 0 ||
      stock === null
    ) {
      throw new Error("Inventory storage returned an invalid stock value.");
    }
    return {
      product_id: candidate.product_id,
      stock,
      ...(typeof candidate.price === "string" && candidate.price.length > 0 ? { price: candidate.price } : {}),
      ...(typeof candidate.updated_at === "string" ? { updated_at: candidate.updated_at } : {}),
    };
  });
}

async function readLocalRows() {
  try {
    const file = await readFile(LOCAL_INVENTORY_FILE, "utf8");
    return parseStoredRows(JSON.parse(file) as unknown);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw new Error("Local inventory storage could not be read.");
  }
}

async function writeLocalRow(productId: string, stock: number, price?: string) {
  const current = await readLocalRows();
  const byId = new Map(current.map((row) => [row.product_id, row]));
  byId.set(productId, { product_id: productId, stock, ...(price ? { price } : {}) });
  const rows = products.map((product) => {
    const saved = byId.get(product.id);
    const row: Record<string, unknown> = { product_id: product.id, stock: saved?.stock ?? 0 };
    if (saved?.price) row.price = saved.price;
    return row;
  });
  const temporaryFile = `${LOCAL_INVENTORY_FILE}.${process.pid}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(rows, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryFile, LOCAL_INVENTORY_FILE);
}

async function readSupabaseRows(config: SupabaseConfig) {
  const headers: HeadersInit = { apikey: config.key };
  if (config.authorization) headers.Authorization = config.authorization;

  const fetchRows = async (includePrice: boolean) => {
    const select = includePrice
      ? "product_id,stock,price,updated_at"
      : "product_id,stock,updated_at";
    const response = await fetch(
      `${config.baseUrl}/rest/v1/cabinet_inventory?select=${select}`,
      { headers, cache: "no-store" }
    );
    return { status: response.status, data: (await response.json()) as unknown };
  };

  const first = await fetchRows(true);
  if (first.status === 200) return parseStoredRows(first.data);

  if (first.status === 400) {
    const fallback = await fetchRows(false);
    if (fallback.status !== 200) {
      throw new Error(`Inventory storage request failed with status ${fallback.status}.`);
    }
    return parseStoredRows(fallback.data);
  }

  throw new Error(`Inventory storage request failed with status ${first.status}.`);
}

async function writeSupabaseRow(config: SupabaseConfig, productId: string, stock: number, price?: string) {
  const headers: HeadersInit = {
    apikey: config.key,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  };
  if (config.authorization) headers.Authorization = config.authorization;

  const upsert = async (includePrice: boolean) => {
    const body: Record<string, unknown> = {
      product_id: productId,
      stock,
      updated_at: new Date().toISOString(),
    };
    if (includePrice && price !== undefined && price.length > 0) body.price = price;
    const response = await fetch(`${config.baseUrl}/rest/v1/cabinet_inventory?on_conflict=product_id`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return response.status;
  };

  const firstStatus = await upsert(true);
  if (firstStatus === 200 || firstStatus === 201 || firstStatus === 204) return;

  if (firstStatus === 400) {
    const secondStatus = await upsert(false);
    if (secondStatus === 200 || secondStatus === 201 || secondStatus === 204) return;
    throw new Error(`Inventory storage update failed with status ${secondStatus}.`);
  }

  throw new Error(`Inventory storage update failed with status ${firstStatus}.`);
}

export async function getInventory(): Promise<InventoryProduct[]> {
  const config = getSupabaseConfig();
  const rows = config ? await readSupabaseRows(config) : await readLocalRows();
  const byProductId = new Map(rows.map((row) => [row.product_id, row]));

  return products.map((product) => {
    const row = byProductId.get(product.id);
    return {
      ...product,
      stock: row?.stock ?? 0,
      price: row?.price || product.price,
    };
  });
}

export async function updateInventory(productId: string, value: unknown, price?: string) {
  const product = products.find((candidate) => candidate.id === productId);
  if (!product) {
    throw new InventoryValidationError("That cabinet does not exist.");
  }

  const stock = parseStockValue(value);
  if (stock === null) {
    throw new InventoryValidationError("Stock must be a whole number from 0 upward.");
  }

  const config = getSupabaseConfig();
  if (config) await writeSupabaseRow(config, productId, stock, price);
  else await writeLocalRow(productId, stock, price);

  return { ...product, stock, price: price ?? product.price };
}
