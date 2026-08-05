import { NextResponse } from "next/server";
import {
  AuthConfigurationError,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import {
  canAttemptLogin,
  clearLoginAttempts,
  getClientAddress,
  recordFailedLogin,
} from "@/lib/login-rate-limit";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  const clientAddress = getClientAddress(request);
  const limit = canAttemptLogin(clientAddress);
  if (!limit.allowed) {
    return json(
      { error: "Too many sign-in attempts. Try again later." },
      429,
      { "Retry-After": String(limit.retryAfter) }
    );
  }

  if (!isSameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    recordFailedLogin(clientAddress);
    return json({ error: "Enter a username and password." }, 400);
  }

  const values = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const username = typeof values.username === "string" ? values.username : "";
  const password = typeof values.password === "string" ? values.password : "";
  if (username.length === 0 || username.length > 100 || password.length === 0 || password.length > 512) {
    recordFailedLogin(clientAddress);
    return json({ error: "Enter a valid username and password." }, 400);
  }

  try {
    const valid = await verifyAdminCredentials(username, password);
    if (!valid) {
      recordFailedLogin(clientAddress);
      return json({ error: "Invalid username or password." }, 401);
    }

    clearLoginAttempts(clientAddress);
    await setAdminSession(username);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return json({ error: "Admin authentication is not configured." }, 503);
    }
    return json({ error: "Unable to sign in right now." }, 500);
  }
}
