# Brokz — Supabase

Postgres schema, migrations, RLS policies, and seed data for the Brokz admin panel + customer portal.

This folder is managed with the [Supabase CLI](https://supabase.com/docs/guides/cli). The CLI is not required to read or review SQL; it is required to run migrations or push to the hosted project.

## Layout

```
supabase/
├── config.toml                              # CLI config (project_id: brokz)
├── migrations/
│   ├── 20260422120000_foundation.sql        # Phase 0 schema + RLS
│   └── 20260422120100_profile_trigger.sql   # auth.users → profiles auto-provision
├── seed.sql                                 # local-only: products + 1 org + 1 draft post
└── README.md
```

## Required environment variables

Frontend (Astro / Vite) `.env`:

```
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Server-side only (Edge Functions, build scripts, never shipped to browser):

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_DB_PASSWORD=<db-password>        # used by `supabase link` / `db push`
```

## Local development

Prerequisites: Docker Desktop running, Supabase CLI installed (`npm i -g supabase` or `scoop install supabase`).

```bash
# 1. Start local stack (Postgres, GoTrue, Studio, Inbucket, Storage)
supabase start

# 2. Apply migrations + seed (destructive: wipes local DB)
supabase db reset

# 3. Open Studio
#    -> http://127.0.0.1:54323
```

After that, the local API is at `http://127.0.0.1:54321` and the DB is at `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

To generate TypeScript types for the frontend:

```bash
supabase gen types typescript --local > ../astro/src/types/supabase.ts
```

## Remote (hosted project)

```bash
# One-time: link local folder to the hosted project
supabase link --project-ref <project-ref>

# Push pending migrations to the hosted DB
supabase db push

# Pull a fresh schema dump (if you made changes in Studio you want to capture)
supabase db pull
```

`seed.sql` is **not** applied on remote by `db push`. That is intentional — the seed is development-only.

## Migration conventions

- Filename: `YYYYMMDDHHMMSS_short_description.sql`.
- One logical change per migration; never edit a migration after it has been applied to any environment.
- Every table: `uuid` PK, `created_at`, `updated_at` + trigger, `snake_case` columns.
- Enums (`create type ... as enum`) instead of `text` for status columns.
- Every table has `alter table ... enable row level security` plus at least one explicit policy.
- `-- rollback:` block at the bottom of every migration with the reverse SQL.

## RLS model (short version)

There are two user roles — `admin` and `customer` — stored on `public.profiles.role`. All policies consult two security-definer helpers defined in the foundation migration:

- `auth.user_role()` → `'admin' | 'customer'` for the current request.
- `auth.user_org()` → the `organization_id` on the current user's profile (NULL for admins).

Resulting access patterns:

| Table             | Anon              | Customer                                        | Admin      |
| ----------------- | ----------------- | ----------------------------------------------- | ---------- |
| `organizations`   | —                 | SELECT own row only                             | Full CRUD  |
| `profiles`        | —                 | SELECT/UPDATE self (role change blocked)        | Full CRUD  |
| `products`        | SELECT active     | SELECT active                                   | Full CRUD  |
| `orders`          | —                 | SELECT own-org (non-deleted)                    | Full CRUD  |
| `licenses`        | —                 | SELECT via own-org orders                       | Full CRUD  |
| `invoices`        | —                 | SELECT own-org (non-deleted)                    | Full CRUD  |
| `tickets`         | —                 | SELECT + INSERT own-org                         | Full CRUD  |
| `ticket_messages` | —                 | SELECT + INSERT within own-org tickets          | Full CRUD  |
| `leads`           | INSERT (form)     | —                                               | Full CRUD  |
| `blog_posts`      | SELECT published  | SELECT published                                | Full CRUD  |
| `audit_log`       | —                 | —                                               | SELECT; writes via service_role only |

`service_role` (Edge Functions, server-side admin tasks) bypasses RLS entirely. Never ship the service-role key to the browser.

## Profile provisioning

When a new `auth.users` row is created, `public.handle_new_user()` fires and inserts the matching `public.profiles` row. It reads role + organization_id + full_name from `raw_user_meta_data`:

```json
{
  "role": "customer",
  "organization_id": "…uuid…",
  "full_name": "Jane Doe"
}
```

Defaults: `role = 'customer'`, `organization_id = null`. To provision an admin user, either set `role: "admin"` in the signup metadata (admin-only signup flow) or promote the profile manually via SQL or Studio.

## Portability note

Brokz plans to migrate frontend hosting off Vercel to shared hosting later (see `hosting_migration_plan.md`). Supabase stays. Keep DB-heavy logic in SQL / RLS / Edge Functions — anything that would require a Node runtime on the host will not survive the move.
