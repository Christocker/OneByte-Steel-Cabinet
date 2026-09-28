# OneByte Steel Cabinets

Next.js 16 App Router website for OneByte Steel Cabinets, including a protected inventory
dashboard and a one-click catalog JPEG export.

## Requirements

- Node 22+ (see `.nvmrc`)
- A Supabase project (Postgres + Storage)

## Development

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

The development-only fallback data lives in `data/inventory.json` / `data/catalog.json`. Production
must use Supabase; the local files are not used when `NODE_ENV=production`.

## Database migrations

Migrations live in `supabase/migrations/` and are applied **manually** in the Supabase SQL editor.
Follow `docs/TIER_B_RUNBOOK.md` (backup → dry run → apply). Current set:

| File | Purpose | Status |
|---|---|---|
| `001_cabinet_inventory.sql` | inventory table + seed | required |
| `002_cabinet_products.sql` | products table + seed + storage bucket | required |
| `003_harden_storage_policies.sql` | scope storage policies to intended roles | **recommended (security)** |
| `004_login_attempts.sql` | durable login rate limiting | draft |
| `005_item_number_sequence.sql` | stable item-number allocation | draft |
| `006_grant_inventory_delete.sql` | allow hard delete of inventory rows | applied |
| `007_remove_inactive_products.sql` | remove hidden listings | optional |
| `008_assembly_recommended.sql` | "Onsite Assembly Recommended" flag | needed for that toggle |

## Env variables

| Variable | Dev | Prod | Notes |
|---|---|---|---|
| `ADMIN_USERNAME` | yes | yes | single admin account |
| `ADMIN_PASSWORD_HASH` | yes | yes | generate with `npm run hash-password` |
| `SESSION_SECRET` | yes | yes | ≥32 chars; rotating it logs everyone out |
| `SUPABASE_URL` | yes | yes | project URL |
| `SUPABASE_SECRET_KEY` | yes | yes | server-only; `SUPABASE_SERVICE_ROLE_KEY` also accepted |
| `VERCEL_PROJECT_PRODUCTION_URL` | no | auto | set by Vercel; used for canonical URLs |

Never expose the Supabase secret key with a `NEXT_PUBLIC_` prefix or commit any `.env` file.

## Admin

Open `/admin` to sign in (sessions are signed, expiring, HttpOnly cookies). Product cards are
collapsed by default; use **Edit** to change fields inline, quick stock buttons for fast stock
changes, and **Delete** (permanent) with confirmation. **Download catalog (JPEG)** generates a
shareable image of the catalog with optional In Stock / Out of Stock / Pre-Order filtering.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Health check: `GET /api/health` (read-only Supabase reachability probe).
