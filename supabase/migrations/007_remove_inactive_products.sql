-- 007_remove_inactive_products.sql
-- STATUS: DRAFT — apply ONLY after a verified backup, and ONLY if you approve
--          permanently deleting the listings previously marked hidden.
-- Purpose: remove the listings that were soft-hidden (active = false) together
--          with their cabinet_inventory rows, so no hidden listings remain.
-- Data impact: DELETES rows WHERE active = false from cabinet_products and the
--              matching cabinet_inventory rows. Every other row is untouched.

-- Preview before applying (run this on its own first):
--   SELECT count(*) FROM public.cabinet_products WHERE active = false;

BEGIN;

DELETE FROM public.cabinet_inventory AS i
  USING public.cabinet_products AS p
  WHERE i.product_id = p.id
    AND p.active = false;

DELETE FROM public.cabinet_products
  WHERE active = false;

COMMIT;

-- No rollback: this is permanent. Restore from the pre-migration backup if needed.
