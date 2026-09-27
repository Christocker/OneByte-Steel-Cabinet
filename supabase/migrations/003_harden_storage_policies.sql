-- 003_harden_storage_policies.sql
-- STATUS: DRAFT — NOT APPLIED. Run only after the backup runbook (docs/TIER_B_RUNBOOK.md).
-- Purpose: make the storage policies from 002 idempotent and scope them to the intended roles.
--          002 created the policies without a TO clause, so they applied to every role.
-- Data impact: NONE (policies only; no rows are read or written).

BEGIN;

-- Table access stays service_role-only (defensive repeats; idempotent).
ALTER TABLE public.cabinet_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabinet_inventory ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.cabinet_products FROM anon, authenticated;
REVOKE ALL ON TABLE public.cabinet_inventory FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cabinet_products TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.cabinet_inventory TO service_role;

-- Recreate the storage.object policies scoped by role. DROP ... IF EXISTS keeps this idempotent.
DROP POLICY IF EXISTS "Service role can manage product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;

CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Service role can manage product images"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

COMMIT;

-- ROLLBACK:
--   DROP POLICY IF EXISTS "Service role can manage product images" ON storage.objects;
--   DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
--   CREATE POLICY "Service role can manage product images" ON storage.objects
--     FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
--   CREATE POLICY "Public can read product images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'product-images');
