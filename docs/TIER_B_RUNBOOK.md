# Tier B Runbook — Backup, Migrate, Roll Back

> **STATUS: DRAFTS ONLY. NOTHING HAS BEEN EXECUTED.**
> Persistent data (`data/*.json`, Supabase tables, Storage objects) must remain protected,
> untouched, and unchanged until every step below is followed.

This runbook covers the deferred Tier B work:

| # | File | Type | Data impact |
|---|------|------|-------------|
| 003 | `supabase/migrations/003_harden_storage_policies.sql` | RLS / policies | **None** (no rows read/written) |
| 004 | `supabase/migrations/004_login_attempts.sql` | New table | **Additive** (empty table only) |
| 005 | `supabase/migrations/005_item_number_sequence.sql` | Sequence + default | **None to existing values** |
| — | `price` → `numeric` | Conversion | **SKIPPED by decision** (rewrites every row; no monetary logic needs it) |

Order is intentional: least risky first. Apply one migration, verify, then proceed.

---

## 0. Guardrails (non-negotiable)

- Never run DDL against production first. Always dry-run on a Supabase **branch or throwaway project**.
- Never edit `data/catalog.json` or `data/inventory.json`.
- Never delete or overwrite Storage objects.
- Every step is reversible; if a rollback path is unclear, stop.
- Record the exact migration file + timestamp applied, per environment.

---

## 1. Backup (do this first, every time)

1. Create a timestamped directory and note its name:
   ```bash
   ts=$(date +%Y%m%d-%H%M%S); echo "$ts"; mkdir -p "backups/$ts"
   ```
2. Full schema + data dump (requires the DB connection string / password, which is **not** in the repo):
   ```bash
   pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner --no-privileges \
     -f "backups/$ts/public.sql"
   ```
3. Belt-and-suspenders data-only dump of the two live tables:
   ```bash
   pg_dump "$SUPABASE_DB_URL" --data-only \
     -t public.cabinet_products -t public.cabinet_inventory \
     -f "backups/$ts/tables-data.sql"
   ```
4. Snapshot the local dev fallback data (copy only — do not modify the originals):
   ```bash
   cp data/catalog.json data/inventory.json "backups/$ts/"
   ```
5. Storage objects are **not** included in `pg_dump`. Export the `product-images` bucket via the
   Supabase CLI or dashboard and store it in `backups/$ts/storage/`.
6. Record baseline counts (compare after each migration):
   ```bash
   psql "$SUPABASE_DB_URL" -c "select count(*) from public.cabinet_products;"
   psql "$SUPABASE_DB_URL" -c "select count(*) from public.cabinet_inventory;"
   ```
7. **Prove the backup restores**: load `public.sql` into a throwaway project/branch and confirm the
   counts match. Only proceed once restore is verified.

---

## 2. Dry run (throwaway branch/project)

1. Point a test environment at the throwaway project.
2. Apply each migration in order, one at a time, committing only after inspection.
3. After each: re-check row counts, `select count(*)` of the new table, and that the storefront and
   admin dashboard still load.

---

## 3. Production execution order

1. Fresh backup (Section 1) + verified restore.
2. Apply `003_harden_storage_policies.sql`.
   - Verify: `select * from pg_policies where schemaname = 'storage' and tablename = 'objects';`
   - Verify: admin image upload still works; public images still load.
3. Apply `004_login_attempts.sql`.
   - Verify: `select count(*) from public.login_attempts;` (expect 0).
   - Companion code change (separate PR): point `lib/login-rate-limit.ts` at this table and add
     cleanup of rows where `reset_at < now()`.
4. Apply `005_item_number_sequence.sql`.
   - Verify: `select nextval('public.cabinet_products_item_number_seq');` returns `max(item_number)+1`.
   - Companion code change (separate PR): in `lib/catalog.ts`, stop passing `item_number` in
     `createProduct` so the sequence default is used; remove the 50-attempt retry loop.
5. Companion code change (separate PR): remove the runtime `exec_sql` auto-DDL in
   `lib/catalog.ts` (`ensureTable`) so migrations become the single source of truth.

---

## 4. Rollback

Per-migration SQL rollbacks are embedded as comments at the bottom of each file.

- **003:**
  ```sql
  DROP POLICY IF EXISTS "Service role can manage product images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
  CREATE POLICY "Service role can manage product images" ON storage.objects
    FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
  CREATE POLICY "Public can read product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');
  ```
- **004:** `DROP TABLE IF EXISTS public.login_attempts;`
- **005:**
  ```sql
  ALTER TABLE public.cabinet_products ALTER COLUMN item_number DROP DEFAULT;
  DROP SEQUENCE IF EXISTS public.cabinet_products_item_number_seq;
  ```
- **Nuclear (data loss risk):** restore `backups/<ts>/public.sql` or use Supabase Point-in-Time
  Recovery. Confirm the target environment before running.
- **Code:** `git revert <commit>` for any companion change.

---

## 5. Verification checklist (after all steps)

- [ ] `cabinet_products` / `cabinet_inventory` row counts unchanged from baseline.
- [ ] Storefront `/` lists the same products with correct stock and prices.
- [ ] Admin login, inventory save, add/edit/hide product, and image upload all work.
- [ ] New product receives the next sequential `item_number` with no collision.
- [ ] Repeated failed logins are throttled and reset after the window.
- [ ] `/api/health` returns `{ "status": "ok" }`.
- [ ] Backup directory retained until the change is confirmed stable.

---

## 6. Explicitly deferred / rejected

- **`price` numeric conversion — NOT doing.** It rewrites every row, changes an intentional
  free-form design, and no sorting/filtering/monetary logic requires it. Revisit only if a concrete
  need appears.
