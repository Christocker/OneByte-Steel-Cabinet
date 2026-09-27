import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import { getProductById, updateProduct, deleteProduct, CatalogError } from "@/lib/catalog";

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

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) return json({ error: "Product not found." }, 404);
    return json({ product });
  } catch {
    return json({ error: "Product could not be loaded." }, 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const v = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const updates: Record<string, unknown> = {};

  if (v.name !== undefined) {
    const name = typeof v.name === "string" ? v.name.trim() : "";
    if (!name) return json({ error: "Product name cannot be empty." }, 400);
    if (name.length > 200) return json({ error: "Product name must be 200 characters or fewer." }, 400);
    updates.name = name;
  }
  if (v.brand !== undefined) {
    const brand = typeof v.brand === "string" ? v.brand.trim() : "";
    if (!brand) return json({ error: "Brand cannot be empty." }, 400);
    if (brand.length > 100) return json({ error: "Brand must be 100 characters or fewer." }, 400);
    updates.brand = brand;
  }
  if (v.price !== undefined) {
    const price = typeof v.price === "string" ? v.price.trim() : "";
    if (!price) return json({ error: "Price cannot be empty." }, 400);
    if (price.length > 100) return json({ error: "Price must be 100 characters or fewer." }, 400);
    updates.price = price;
  }
  if (v.dimensions !== undefined) {
    const dims = typeof v.dimensions === "string" ? v.dimensions.trim() : "";
    if (!dims) return json({ error: "Dimensions cannot be empty." }, 400);
    if (dims.length > 100) return json({ error: "Dimensions must be 100 characters or fewer." }, 400);
    updates.dimensions = dims;
  }
  if (v.images !== undefined) {
    if (!Array.isArray(v.images)) return json({ error: "Images must be an array." }, 400);
    updates.images = v.images as string[];
  }
  if (v.preorder !== undefined) {
    updates.preorder = v.preorder === true;
  }
  if (v.active !== undefined) {
    updates.active = v.active === true;
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: "No fields to update." }, 400);
  }

  try {
    const product = await updateProduct(id, updates as Parameters<typeof updateProduct>[1]);
    if (!product) return json({ error: "Product not found." }, 404);
    revalidatePath("/");
    return json({ product });
  } catch (error) {
    if (error instanceof CatalogError) {
      return json({ error: error.message }, 400);
    }
    const msg = error instanceof Error ? error.message : "Unable to update product.";
    return json({ error: msg }, 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  const { id } = await params;
  try {
    await deleteProduct(id);
    revalidatePath("/");
    return json({ ok: true });
  } catch (error) {
    if (error instanceof CatalogError) {
      return json({ error: error.message }, 400);
    }
    const msg = error instanceof Error ? error.message : "Unable to delete product.";
    return json({ error: msg }, 500);
  }
}
