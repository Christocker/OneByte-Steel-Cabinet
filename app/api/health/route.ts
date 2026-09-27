import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = secretKey || legacyKey;
  if (!url || !key) return null;
  return {
    baseUrl: url.replace(/\/+$/, ""),
    key,
    ...(secretKey ? {} : { authorization: `Bearer ${legacyKey}` }),
  };
}

export async function GET() {
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ status: "unconfigured" }, { status: 503 });
  }

  const headers: HeadersInit = { apikey: config.key };
  if (config.authorization) headers.Authorization = config.authorization;

  try {
    // Read-only reachability probe; never mutates data.
    const res = await fetch(
      `${config.baseUrl}/rest/v1/cabinet_products?select=id&limit=1`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { status: "degraded", supabase: res.status },
        { status: 503 }
      );
    }
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "degraded", supabase: "unreachable" }, { status: 503 });
  }
}
