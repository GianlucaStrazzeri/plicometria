**Supabase Production Setup**

- **Env vars (set in Vercel project settings)**:
  - `NEXT_PUBLIC_SUPABASE_URL` (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `ADMIN_API_KEY` (server-only, used to protect admin-only API routes)

- **Protect admin endpoints**: admin-only API routes in `app/api/clients` expect an HTTP header `x-admin-key` equal to `ADMIN_API_KEY`.

- **RLS (recommended)**: enable Row-Level Security on important tables and create policies to allow access only to authenticated users for writes. Example:

```sql
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated"
  ON public.clients
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated"
  ON public.clients
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update/delete for authenticated"
  ON public.clients
  FOR UPDATE, DELETE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

- **Seed / schema changes**: use `scripts/create_tables.js` and `scripts/seed.js` locally (requires `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). Do not run these automatically in production without protection.
