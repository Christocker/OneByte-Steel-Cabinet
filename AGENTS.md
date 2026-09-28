<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# OneByte Steel Cabinets — agent guide

Next.js 16 App Router storefront + a single-admin inventory dashboard for a steel-cabinet
dealer in Dasmariñas, Cavite. Contact/chat driven, no checkout.

## Commands

```bash
npm install
npm run dev        # local dev
npm run lint       # eslint (also run in CI)
npm test           # node:test unit tests
npm run build      # production build (type-checks too)
```

Always run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` before finishing.

## Architecture map

- `app/` — App Router. Public one-pager (`page.tsx`), `/admin` + `/admin/login`, API routes
  under `app/api/**` (all `runtime = "nodejs"`, each mutating route re-checks `isAdmin()` +
  same-origin), `opengraph-image.tsx`, `robots.ts`, `sitemap.ts`.
- `components/` — public sections + shared `CatalogCardShell` and `PhotoLightbox`
  (used by the public card, gallery, admin cards, and export). `components/admin/*` is the dashboard.
- `lib/` — `catalog.ts` (product repository), `inventory.ts` (stock/price service),
  `item-number.ts` (numbering), `catalog-image.ts` (JPEG export), auth/CSRF/validation helpers.
- `data/` — **dev-only** JSON fallback. Never hand-edit; production uses Supabase.
- `supabase/migrations/` — schema. Drafts are marked `STATUS: DRAFT — NOT APPLIED`.
- `docs/TIER_B_RUNBOOK.md` — backup/migrate/rollback procedure.

## Data rules (important)

- Persistent data is protected: do not modify `data/*.json`, Supabase tables, or Storage
  without an explicit request and the runbook's backup step.
- Never run migrations automatically. They are applied manually in the Supabase SQL editor.
- "Delete" in the admin is a permanent hard delete of the product + its inventory row.
- Item numbers displayed on the site and admin are contiguous and must always match.
