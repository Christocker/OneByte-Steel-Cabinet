import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "product-images";

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = secretKey || legacyKey;
  if (!url || !key) return null;
  return { baseUrl: url.replace(/\/+$/, ""), key };
}

async function ensureBucket(config: { baseUrl: string; key: string }, bucket: string) {
  const headers = { apikey: config.key, Authorization: `Bearer ${config.key}` };
  // Check if bucket exists
  const listRes = await fetch(`${config.baseUrl}/storage/v1/bucket`, {
    method: "GET",
    headers,
  });
  if (listRes.ok) {
    const buckets = (await listRes.json()) as { id: string }[];
    if (buckets.some((b) => b.id === bucket)) return;
  }
  // Create bucket if missing
  await fetch(`${config.baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ id: bucket, name: bucket, public: true }),
  });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return json({ error: "Authentication required." }, 401);
  }

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  const config = getSupabaseConfig();
  if (!config) {
    return json({ error: "Storage is not configured." }, 503);
  }

  // Ensure the storage bucket exists
  await ensureBucket(config, BUCKET);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Invalid form data." }, 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return json({ error: "No file provided." }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return json({ error: "File must be JPG, PNG, or WebP." }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return json({ error: "File must be 5MB or smaller." }, 400);
  }

  const productId = typeof formData.get("product_id") === "string"
    ? formData.get("product_id") as string
    : "unknown";

  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = `${productId}/${timestamp}-${random}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const uploadRes = await fetch(
    `${config.baseUrl}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": file.type,
      },
      body: uint8,
    }
  );

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    return json({ error: `Upload failed (${uploadRes.status}): ${text}` }, 500);
  }

  const publicUrl = `${config.baseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  return json({ url: publicUrl });
}
