# OneByte Steel Cabinets

Next.js App Router website for OneByte Steel Cabinets, including a protected inventory dashboard.

## Development

```bash
npm install
npm run dev
```

The development-only inventory fallback is stored in `data/inventory.json`. Production deployments must use Supabase; the local file is not used when `NODE_ENV=production`.

If production storage variables are missing, the public storefront fails safe with zero stock instead of returning a server error. Admin inventory saves remain unavailable until Supabase is configured.

## Admin Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_cabinet_inventory.sql` in the Supabase SQL editor.
3. Generate a password hash without storing the password in the repository:

```bash
npm run hash-password
```

4. Set the generated output and the other values in `.env.local` for local development and in Vercel for production:

```text
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD_HASH=the-scrypt-value-from-the-command
SESSION_SECRET=a-random-secret-at-least-32-characters-long
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-server-only-supabase-secret-key
```

`SUPABASE_SERVICE_ROLE_KEY` is also accepted for existing Supabase projects using the legacy key name. Never expose either server key with a `NEXT_PUBLIC_` prefix or commit any `.env` file.

Open `/admin` to sign in. Sessions are signed, expiring, HttpOnly cookies. Inventory writes are accepted only from an authenticated admin and validated as non-negative integers before being persisted.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The public home page reads inventory with uncached server requests, so a refresh reflects the latest saved quantities and status indicators.
