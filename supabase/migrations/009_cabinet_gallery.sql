-- 009_cabinet_gallery.sql
-- STATUS: DRAFT — apply before using the admin Gallery add/remove controls.
-- Purpose: persist the public gallery photos so the admin can add and remove them.
-- Data impact: ADDITIVE — creates one new table and seeds the existing 15 photos.
-- No existing table or row is changed.

BEGIN;

CREATE TABLE IF NOT EXISTS public.cabinet_gallery (
  id text PRIMARY KEY,
  url text NOT NULL,
  width integer NOT NULL CHECK (width > 0),
  height integer NOT NULL CHECK (height > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.cabinet_gallery ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.cabinet_gallery FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cabinet_gallery TO service_role;

CREATE INDEX IF NOT EXISTS cabinet_gallery_sort_order_idx
  ON public.cabinet_gallery (sort_order);

INSERT INTO public.cabinet_gallery (id, url, width, height, sort_order)
VALUES
  ('gallery-01', '/images/gallery/gallery-01.jpg', 900, 1600, 1),
  ('gallery-02', '/images/gallery/gallery-02.jpg', 1200, 1600, 2),
  ('gallery-03', '/images/gallery/gallery-03.jpg', 1200, 1600, 3),
  ('gallery-04', '/images/gallery/gallery-04.jpg', 944, 1600, 4),
  ('gallery-05', '/images/gallery/gallery-05.jpg', 1600, 1200, 5),
  ('gallery-06', '/images/gallery/gallery-06.jpg', 1200, 1600, 6),
  ('gallery-07', '/images/gallery/gallery-07.jpg', 1200, 1600, 7),
  ('gallery-08', '/images/gallery/gallery-08.jpg', 1600, 1200, 8),
  ('gallery-09', '/images/gallery/gallery-09.jpg', 1200, 1600, 9),
  ('gallery-10', '/images/gallery/gallery-10.jpg', 1200, 1600, 10),
  ('gallery-11', '/images/gallery/gallery-11.jpg', 1200, 1600, 11),
  ('gallery-12', '/images/gallery/gallery-12.jpg', 1200, 1600, 12),
  ('gallery-13', '/images/gallery/gallery-13.jpg', 1200, 1600, 13),
  ('gallery-14', '/images/gallery/gallery-14.jpg', 1200, 1600, 14),
  ('gallery-15', '/images/gallery/gallery-15.jpg', 1200, 1600, 15)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ROLLBACK:
--   DROP TABLE IF EXISTS public.cabinet_gallery;
