-- 004_login_attempts.sql
-- STATUS: DRAFT — NOT APPLIED. Run only after the backup runbook (docs/TIER_B_RUNBOOK.md).
-- Purpose: durable, cross-instance login rate limiting (replaces the in-memory Map in
--          lib/login-rate-limit.ts, which resets on cold starts and is not shared).
-- Data impact: ADDITIVE — creates a new empty table; reads/writes no existing data.

BEGIN;

CREATE TABLE IF NOT EXISTS public.login_attempts (
  client_key text PRIMARY KEY,
  attempts   integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  reset_at   timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.login_attempts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.login_attempts TO service_role;

CREATE INDEX IF NOT EXISTS login_attempts_reset_at_idx
  ON public.login_attempts (reset_at);

COMMIT;

-- ROLLBACK:
--   DROP TABLE IF EXISTS public.login_attempts;
