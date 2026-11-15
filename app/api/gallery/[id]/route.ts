import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import {
  deleteGalleryPhoto,
  GalleryConfigurationError,
  GalleryError,
  GalleryValidationError,
} from "@/lib/gallery";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function requireAdmin() {
  return (await isAdmin()) ? null : json({ error: "Authentication required." }, 401);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  const { id } = await params;

  try {
    await deleteGalleryPhoto(id);
    revalidatePath("/");
    return json({ ok: true });
  } catch (error) {
    if (error instanceof GalleryValidationError) {
      return json({ error: error.message }, 400);
    }
    if (error instanceof GalleryConfigurationError) {
      return json({ error: error.message }, 503);
    }
    if (error instanceof GalleryError) {
      const status = error.message === "Photo not found." ? 404 : 500;
      return json({ error: error.message }, status);
    }
    return json({ error: "Gallery photo could not be removed." }, 500);
  }
}
