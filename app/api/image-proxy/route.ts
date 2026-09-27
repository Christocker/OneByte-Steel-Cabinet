import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_HOST_SUFFIX = ".supabase.co";
const ALLOWED_PATH_PREFIX = "/storage/v1/object/";

function allowedHost(): string | null {
  const configured = process.env.SUPABASE_URL?.trim();
  if (!configured) return null;
  try {
    return new URL(configured).hostname;
  } catch {
    return null;
  }
}

// Admin-only proxy that streams Supabase Storage images through our own origin.
// This lets the browser draw them onto a <canvas> for the catalog export without
// the canvas being tainted (which would block toBlob/JPEG encoding).
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }

  const pinned = allowedHost();
  const hostOk = pinned
    ? target.hostname === pinned
    : target.hostname.endsWith(ALLOWED_HOST_SUFFIX);

  if (
    target.protocol !== "https:" ||
    !hostOk ||
    !target.pathname.startsWith(ALLOWED_PATH_PREFIX)
  ) {
    return NextResponse.json({ error: "URL not allowed." }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      cache: "no-store",
      // Never follow redirects to an unvalidated destination.
      redirect: "error",
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Image not found." }, { status: 502 });
    }

    const contentType = (upstream.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    // Only ever return image bytes; never pass through HTML/SVG etc.
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image." }, { status: 415 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "attachment",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image fetch failed." }, { status: 502 });
  }
}
