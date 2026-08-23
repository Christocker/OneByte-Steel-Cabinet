import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import { getAllProducts, createProduct, CatalogError } from "@/lib/catalog";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function requireAdmin() {
  return (await isAdmin()) ? null : json({ error: "Authentication required." }, 401);
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    return json({ products: await getAllProducts() });
  } catch {
    return json({ error: "Products could not be loaded." }, 500);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const v = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof v.name === "string" ? v.name.trim() : "";
  const brand = typeof v.brand === "string" ? v.brand.trim() : "";
  const price = typeof v.price === "string" ? v.price.trim() : "";
  const dimensions = typeof v.dimensions === "string" ? v.dimensions.trim() : "";
  const images = Array.isArray(v.images) ? (v.images as string[]) : [];
  const stock = typeof v.stock === "number" ? v.stock : typeof v.stock === "string" ? Number(v.stock) : 0;
  const preorder = v.preorder === true;

  if (!name) return json({ error: "Product name is required." }, 400);
  if (name.length > 200) return json({ error: "Product name must be 200 characters or fewer." }, 400);
  if (!brand) return json({ error: "Brand is required." }, 400);
  if (brand.length > 100) return json({ error: "Brand must be 100 characters or fewer." }, 400);
  if (!price) return json({ error: "Price is required." }, 400);
  if (price.length > 100) return json({ error: "Price must be 100 characters or fewer." }, 400);
  if (!dimensions) return json({ error: "Dimensions are required." }, 400);
  if (dimensions.length > 100) return json({ error: "Dimensions must be 100 characters or fewer." }, 400);
  if (!Number.isInteger(stock) || stock < 0) return json({ error: "Stock must be a non-negative integer." }, 400);

  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!baseId) return json({ error: "Could not generate a product ID." }, 400);

  // Add timestamp suffix to ensure uniqueness
  const id = `${baseId}-${Date.now()}`;

  // Use client-provided item number (computed from the loaded product list)
  const nextItemNumber = typeof v.nextItemNumber === "number" && v.nextItemNumber > 0
    ? v.nextItemNumber
    : undefined;

  try {
    const product = await createProduct({
      id,
      name,
      brand,
      price,
      dimensions,
      images,
      stock,
      preorder,
      nextItemNumber,
    });
    revalidatePath("/");
    return json({ product }, 201);
  } catch (error) {
    if (error instanceof CatalogError) {
      return json({ error: error.message }, 400);
    }
    const msg = error instanceof Error ? error.message : "Unable to create product.";
    return json({ error: msg }, 500);
  }
}
