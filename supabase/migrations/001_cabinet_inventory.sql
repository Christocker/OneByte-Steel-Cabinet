create table if not exists public.cabinet_inventory (
  product_id text primary key,
  stock integer not null default 0 check (stock >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.cabinet_inventory enable row level security;

revoke all on table public.cabinet_inventory from anon, authenticated;

insert into public.cabinet_inventory (product_id, stock)
values
  ('full-metal-light-gray', 0),
  ('full-glass-sliding-gray-white', 0),
  ('full-glass-sliding-white', 0),
  ('full-glass-white', 0),
  ('full-metal-gray-white', 0),
  ('half-glass-white', 0),
  ('wardrobe-brown-beige', 0),
  ('wardrobe-shelves-woodgrain', 0),
  ('half-glass-light-gray', 0),
  ('full-glass-coffee-beige', 0),
  ('full-metal-white', 0),
  ('half-glass-coffee-beige', 0),
  ('multi-purpose-wardrobe', 0),
  ('wardrobe-shelves-print-gray', 0),
  ('wardrobe-shelves-white', 0)
on conflict (product_id) do nothing;
