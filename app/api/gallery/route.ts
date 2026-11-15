import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import {
  addGalleryPhoto,
  GalleryConfigurationError,
  GalleryError,
  GalleryValidationError,
  getGallery,
  reorderGalleryPhotos,
} from "@/lib/gallery";

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
    return json({ photos: await getGallery() });
  } catch (error) {
    if (error instanceof GalleryConfigurationError) {
      return json({ error: error.message }, 503);
    }
    return json({ error: "Gallery could not be loaded." }, 500);
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

  const values = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  try {
    const photo = await addGalleryPhoto({
      url: values.url,
      width: values.width,
      height: values.height,
    });
    revalidatePath("/");
    return json({ photo }, 201);
  } catch (error) {
    if (error instanceof GalleryValidationError) {
      return json({ error: error.message }, 400);
    }
    if (error instanceof GalleryConfigurationError) {
      return json({ error: error.message }, 503);
    }
    if (error instanceof GalleryError) {
      return json({ error: error.message }, 500);
    }
    return json({ error: "Gallery photo could not be added." }, 500);
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
    return json({ error: "Invalid request body." }, 400);
  }

  const values = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const ids = Array.isArray(values.ids) ? values.ids : null;

  try {
    if (!ids) {
      throw new GalleryValidationError("A complete gallery order is required.");
    }
    const photos = await reorderGalleryPhotos(ids);
    revalidatePath("/");
    return json({ photos });
  } catch (error) {
    if (error instanceof GalleryValidationError) {
      return json({ error: error.message }, 400);
    }
    if (error instanceof GalleryConfigurationError) {
      return json({ error: error.message }, 503);
    }
    if (error instanceof GalleryError) {
      return json({ error: error.message }, 500);
    }
    return json({ error: "Gallery order could not be saved." }, 500);
  }
}
