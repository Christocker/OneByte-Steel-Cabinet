-- 005_item_number_sequence.sql
-- STATUS: DRAFT — NOT APPLIED. Run only after the backup runbook (docs/TIER_B_RUNBOOK.md).
-- Purpose: stable, collision-resistant item_number allocation via a Postgres sequence.
-- Data impact: schema DEFAULT + new sequence only. Existing item_number values are NOT changed.
-- NOTE: requires a companion code change so createProduct stops supplying item_number
--       (otherwise the client value overrides the default). See docs/TIER_B_RUNBOOK.md.

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.cabinet_products_item_number_seq;

-- Seed above the current maximum WITHOUT touching any row. is_called=true => next nextval = max + 1.
SELECT setval(
  'public.cabinet_products_item_number_seq',
  COALESCE((SELECT MAX(item_number) FROM public.cabinet_products), 0),
  true
);

ALTER TABLE public.cabinet_products
  ALTER COLUMN item_number SET DEFAULT nextval('public.cabinet_products_item_number_seq');

ALTER SEQUENCE public.cabinet_products_item_number_seq
  OWNED BY public.cabinet_products.item_number;

COMMIT;

-- ROLLBACK:
--   ALTER TABLE public.cabinet_products ALTER COLUMN item_number DROP DEFAULT;
--   DROP SEQUENCE IF EXISTS public.cabinet_products_item_number_seq;
