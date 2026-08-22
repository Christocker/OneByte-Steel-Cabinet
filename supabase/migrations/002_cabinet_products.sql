-- 002_cabinet_products.sql
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.cabinet_products (
  id text PRIMARY KEY, item_number integer NOT NULL UNIQUE,
  brand text NOT NULL, name text NOT NULL, price text NOT NULL,
  dimensions text NOT NULL, images text[] NOT NULL DEFAULT '{}',
  preorder boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.cabinet_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cabinet_products FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cabinet_products TO service_role;

INSERT INTO public.cabinet_products (id,item_number,brand,name,price,dimensions,images,preorder)
VALUES
  ('full-metal-light-gray',1,'Steeline','Full Metal Cabinet — Light Gray','5800','180 × 80 × 40 cm',ARRAY['/images/products/steeline-full-metal-light-gray-1.png','/images/products/steeline-full-metal-light-gray-2.png'],false),
  ('full-glass-sliding-gray-white',2,'WorldCraft','Full Glass Sliding Cabinet — Gray & White','7200','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-full-glass-sliding-gray-white-1.jpg','/images/products/worldcraft-full-glass-sliding-gray-white-2.png'],false),
  ('full-glass-sliding-white',3,'WorldCraft','Full Glass Sliding Cabinet — White','7500','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-full-glass-sliding-white-1.png','/images/products/worldcraft-full-glass-sliding-white-2.jpg'],false),
  ('full-glass-white',4,'WorldCraft','Full Glass Cabinet — White','7300','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-full-glass-white-1.png','/images/products/worldcraft-full-glass-white-2.jpg'],false),
  ('full-metal-gray-white',5,'WorldCraft','Full Metal Cabinet — Gray & White','6000','185 × 85 × 40 cm',ARRAY['/images/products/worldcraft-full-metal-gray-white-1.png','/images/products/worldcraft-full-metal-gray-white-2.jpg'],false),
  ('half-glass-white',6,'WorldCraft','Half Glass Cabinet — White','6800','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-half-glass-white-1.png','/images/products/worldcraft-half-glass-white-2.jpg'],false),
  ('wardrobe-brown-beige',7,'WorldCraft','Wardrobe Cabinet — Brown & Beige','7500','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-brown-beige-1.png','/images/products/worldcraft-wardrobe-brown-beige-2.png'],false),
  ('wardrobe-shelves-woodgrain',8,'WorldCraft','Wardrobe with Shelves — Woodgrain','7200','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-shelves-woodgrain-1.png','/images/products/worldcraft-wardrobe-shelves-woodgrain-2.png'],false),
  ('half-glass-light-gray',9,'Steeline','Half Glass Cabinet — Light Gray','5800','180 × 80 × 40 cm',ARRAY['/images/products/steeline-half-glass-light-gray-1.png','/images/products/steeline-half-glass-light-gray-2.jpg'],false),
  ('full-glass-coffee-beige',10,'WorldCraft','Full Glass Cabinet — Coffee Beige','7300','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-full-glass-coffee-beige-1.png','/images/products/worldcraft-full-glass-coffee-beige-2.jpg'],false),
  ('full-metal-white',11,'WorldCraft','Full Metal Cabinet — White','6800','185 × 85 × 40 cm',ARRAY['/images/products/worldcraft-full-metal-white-1.png','/images/products/worldcraft-full-metal-white-2.png'],false),
  ('half-glass-coffee-beige',12,'WorldCraft','Half Glass Cabinet — Coffee Beige','6800','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-half-glass-coffee-beige-1.png','/images/products/worldcraft-half-glass-coffee-beige-2.jpg'],false),
  ('multi-purpose-wardrobe',13,'WorldCraft','Multi-Purpose Wardrobe','7800','180 × 80 × 40 cm',ARRAY['/images/products/worldcraft-multi-purpose-wardrobe-1.png','/images/products/worldcraft-multi-purpose-wardrobe-2.png'],false),
  ('wardrobe-shelves-print-gray',14,'WorldCraft','Wardrobe with Shelves — Print Gray','6800','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-shelves-print-gray-1.png','/images/products/worldcraft-wardrobe-shelves-print-gray-2.jpg'],false),
  ('wardrobe-shelves-white',15,'WorldCraft','Wardrobe with Shelves — White','7600','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-shelves-white-1.png','/images/products/worldcraft-wardrobe-shelves-white-2.png'],false),
  ('half-glass-black-woodgrain',16,'WorldCraft','Half Glass Cabinet — Black Woodgrain','6200','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-half-glass-black-woodgrain-1.png','/images/products/worldcraft-half-glass-black-woodgrain-2.jpg'],false),
  ('wardrobe-hanger-white',17,'WorldCraft','Wardrobe with Hanger — White','7000','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-hanger-white-1.png','/images/products/worldcraft-wardrobe-hanger-white-2.png'],false),
  ('full-glass-gray-white',18,'WorldCraft','Full Glass Cabinet — Gray & White','6000','185 × 90 × 40 cm',ARRAY['/images/products/worldcraft-full-glass-gray-white-1.png','/images/products/worldcraft-full-glass-gray-white-2.jpg'],false),
  ('wardrobe-hanger-black-woodgrain',19,'WorldCraft','Wardrobe with Hanger — Black Woodgrain','6600','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-hanger-black-woodgrain-1.png','/images/products/worldcraft-wardrobe-hanger-black-woodgrain-2.png'],false),
  ('lateral-filing-4-drawers',20,'OneByte','Lateral Filing Cabinet 4-Drawers','8100','133.1 × 90 × 45 cm',ARRAY['/images/products/lateral-filing-4-drawers-1.jpg'],true),
  ('lateral-filing-3-drawers',21,'OneByte','Lateral Filing Cabinet 3-Drawers','6700','103.1 × 90 × 45 cm',ARRAY['/images/products/lateral-filing-3-drawers-1.jpg'],true),
  ('steeline-full-glass-light-gray',22,'Steeline','Full Glass Cabinet — Light Gray','5800','180 × 80 × 40 cm',ARRAY['/images/products/steeline-full-glass-light-gray-1.png','/images/products/steeline-full-glass-light-gray-2.jpg'],false),
  ('worldcraft-wardrobe-shelves-print-pink',23,'WorldCraft','Wardrobe with Shelves — Print Pink','6800','185 × 90 × 45 cm',ARRAY['/images/products/worldcraft-wardrobe-shelves-print-pink-1.jpg','/images/products/worldcraft-wardrobe-shelves-print-pink-2.jpg','/images/products/worldcraft-wardrobe-shelves-print-pink-3.jpg'],false)
ON CONFLICT (id) DO NOTHING;

-- Ensure inventory rows exist for all products (does NOT touch existing stock)
INSERT INTO public.cabinet_inventory (product_id, stock)
SELECT p.id, 0 FROM public.cabinet_products p
WHERE NOT EXISTS (SELECT 1 FROM public.cabinet_inventory i WHERE i.product_id = p.id)
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images','product-images',true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Service role can manage product images" ON storage.objects FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public can read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
