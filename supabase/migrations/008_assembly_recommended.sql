-- 008_assembly_recommended.sql
-- STATUS: DRAFT — apply this BEFORE deploying the code that writes the column.
-- Purpose: per-product flag shown as "Onsite Assembly Recommended" on the card.
-- Data impact: ADDITIVE column with a default. Existing rows become false and no
--              existing value is changed.
--
-- IMPORTANT: until this is applied, turning the assembly toggle ON (or creating
-- a product with it ON) will fail, because PostgREST rejects the unknown column.
-- Ordinary edits (assembly unchanged) and normal product creation still work.

ALTER TABLE public.cabinet_products
  ADD COLUMN IF NOT EXISTS assembly_recommended boolean NOT NULL DEFAULT false;

-- ROLLBACK:
--   ALTER TABLE public.cabinet_products DROP COLUMN IF EXISTS assembly_recommended;
