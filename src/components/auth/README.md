# Auth components

Client-side authentication primitives for the Brokz Astro app.

## Why client-side

Brokz deploys to **shared hosting with no Node runtime** (see
`hosting_migration_plan.md`). `astro.config.mjs` is locked to
`output: 'static'`, which means:

- Astro middleware does not run in production.
- `Astro.locals` is not populated at request time.
- Any server-side route guard would silently do nothing on the real site.

Real security is enforced by **Supabase Postgres RLS**. These components
exist only to give authenticated surfaces a sane UX:

- Stop unauthenticated users from seeing dashboard chrome flash on mount.
- Send customers to `/dashboard`, admins to `/admin`, with no cross-over.
- Expose a `useAuth()` hook so child components don't have to re-fetch
  the session + profile on every render.

## Usage

Wrap any protected page's root island in an `<AuthGuard>`:

```tsx
// src/pages/admin/index.astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
import AdminShell from '../../components/admin/AdminShell.tsx';
import AuthGuard from '../../components/auth/AuthGuard.tsx';
---
<AdminLayout>
  <AuthGuard requireRole="admin" client:load>
    <AdminShell />
  </AuthGuard>
</AdminLayout>
```

Inside any descendant component, grab the session:

```tsx
import { useAuth } from '../auth/AuthContext';

export function OrganizationBanner() {
    const { profile, supabase } = useAuth();
    // profile.role, profile.organization_id, supabase queries…
}
```

### Props

| prop          | values                            | default         | meaning |
| ------------- | --------------------------------- | --------------- | ------- |
| `requireRole` | `'admin' \| 'customer' \| 'any'`  | `'any'`         | Role the signed-in user must hold. Mismatches redirect. |
| `redirectTo`  | path string                       | `'/auth/login'` | Where to send unauthenticated users. Current path is appended as `?redirect=…`. |

### Redirect behaviour

- No session → `redirectTo?redirect=<current-path>`
- `requireRole="admin"` but role is `customer` → `/dashboard`
- `requireRole="customer"` but role is `admin` → `/admin`
- Auth state transitions to `SIGNED_OUT` → `/`

## Security reminder

The guard runs in JavaScript in the browser. A determined user can
disable it with devtools. That is **fine** — they still cannot read or
write data they shouldn't, because RLS policies on every Supabase
table check `auth.uid()` and the `profiles.role`. If an RLS policy is
missing, the guard does not save you.

If you add a protected surface, the workflow is:

1. Write the RLS policy first (owner: `brokz-db-architect`).
2. Then wrap the UI in `<AuthGuard>` for UX polish.
