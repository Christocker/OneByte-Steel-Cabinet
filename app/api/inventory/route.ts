import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import {
  getInventory,
  InventoryConfigurationError,
  InventoryValidationError,
  updateInventory,
} from "@/lib/inventory";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function requireAdmin() {
  return (await isAdmin())
    ? null
    : json({ error: "Authentication required." }, 401);
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    return json({ products: await getInventory() });
  } catch (error) {
    if (error instanceof InventoryConfigurationError) {
      return json({ error: "Inventory storage is not configured." }, 503);
    }
    return json({ error: "Inventory could not be loaded." }, 500);
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Send a cabinet and a valid stock quantity." }, 400);
  }

  const values = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const productId = typeof values.productId === "string" ? values.productId : "";
  const priceValue = typeof values.price === "string" && values.price.trim().length > 0
    ? values.price.trim()
    : undefined;

  try {
    const product = await updateInventory(productId, values.stock, priceValue);
    revalidatePath("/");
    return json({ product });
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      return json({ error: error.message }, 400);
    }
    if (error instanceof InventoryConfigurationError) {
      return json({ error: "Inventory storage is not configured." }, 503);
    }
    return json({ error: "Inventory could not be saved." }, 500);
  }
}
