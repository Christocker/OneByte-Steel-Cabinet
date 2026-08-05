const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type AttemptBucket = {
  attempts: number;
  resetAt: number;
};

const attempts = new Map<string, AttemptBucket>();

function prune(now: number) {
  for (const [key, bucket] of attempts) {
    if (bucket.resetAt <= now) attempts.delete(key);
  }
}

export function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function canAttemptLogin(key: string) {
  const now = Date.now();
  prune(now);
  const bucket = attempts.get(key);
  if (!bucket || bucket.resetAt <= now) {
    return { allowed: true, retryAfter: 0 };
  }

  return {
    allowed: bucket.attempts < MAX_ATTEMPTS,
    retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { attempts: 1, resetAt: now + WINDOW_MS });
    return;
  }
  current.attempts += 1;
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}
