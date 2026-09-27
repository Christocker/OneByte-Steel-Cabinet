-- 006_grant_inventory_delete.sql
-- STATUS: DRAFT — apply after a verified backup (see docs/TIER_B_RUNBOOK.md).
-- Purpose: allow permanent product deletion to also remove the product's
--          cabinet_inventory row. Currently service_role only has
--          SELECT/INSERT/UPDATE on cabinet_inventory.
-- Data impact: NONE (privilege only; no rows are read, written, or deleted).

BEGIN;

GRANT DELETE ON TABLE public.cabinet_inventory TO service_role;

COMMIT;

-- ROLLBACK:
--   REVOKE DELETE ON TABLE public.cabinet_inventory FROM service_role;
