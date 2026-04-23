# admin-invite-user

Admin-only Edge Function that onboards a new user to Brokz. Creates (or
reuses) an `organizations` row, generates a Supabase invite action link,
upserts the `profiles` row with the requested role + org, and sends a
branded Brokz invitation email via Resend.

## Request

`POST /functions/v1/admin-invite-user`

Headers:
- `Authorization: Bearer <admin access_token>` — REQUIRED
- `Content-Type: application/json`
- `apikey: <anon key>` — required by Supabase's edge gateway

Body:
```json
{
  "email": "new.user@acme.com",
  "organization_id": "…uuid… (optional if organization_name given)",
  "organization_name": "Acme Capital (optional if organization_id given)",
  "country": "TR",
  "website": "https://acme.com",
  "contact_email": "ops@acme.com",
  "role": "customer",
  "full_name": "Jane Doe",
  "locale": "tr"
}
```

Validation rules:
- `email` required, lowercased.
- Either `organization_id` OR `organization_name` MUST be provided when
  `role === 'customer'` (admins may be org-less).
- `role` defaults to `customer`.
- `locale` defaults to `tr`.

## Response

Success (200):
```json
{
  "ok": true,
  "data": {
    "user_id": "…uuid…",
    "organization_id": "…uuid…",
    "invited": true
  }
}
```

`invited: false` means a user with that email already existed — the
function is idempotent and returns the current row without sending a
duplicate invite.

## Error codes

| Status | Shape                                                                 | Cause |
|-------:|------------------------------------------------------------------------|-------|
| 400    | `{ ok:false, error:'Validation failed', fields:{…} }`                  | Zod validation |
| 400    | `{ ok:false, error:'organization_id or organization_name is required…'}` | Missing org |
| 401    | `{ ok:false, error:'…' }`                                              | Missing / invalid access token |
| 403    | `{ ok:false, error:'Admin role required' }`                            | Caller is not admin |
| 404    | `{ ok:false, error:'Organization not found' }`                         | `organization_id` does not exist |
| 405    | `{ ok:false, error:'Method not allowed' }`                             | Non-POST |
| 500    | `{ ok:false, error:'Could not resolve organization' }` etc.            | DB / upstream |

## Env vars

Required at Supabase dashboard → Edge Functions → admin-invite-user → Secrets:
- `RESEND_API_KEY`
- `PUBLIC_SITE_URL` — e.g. `https://brokztech.com`; used to build the
  `redirectTo` URL `${PUBLIC_SITE_URL}/auth/accept-invite`.
- `CONTACT_FROM_EMAIL` — Resend sender identity.
- `ALLOWED_ORIGINS` — comma-separated list of browser origins.

Auto-injected by the Supabase runtime:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## curl example

```bash
curl -X POST \
  "$SUPABASE_URL/functions/v1/admin-invite-user" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: https://brokztech.com" \
  -d '{
    "email": "jane@acme.com",
    "organization_name": "Acme Capital",
    "country": "TR",
    "role": "customer",
    "full_name": "Jane Doe",
    "locale": "tr"
  }'
```

## Security notes

- UI-side "is admin" checks are advisory only. `requireAdmin(req)` re-runs
  the check against the DB every time.
- Emails are masked in logs (`j***@example.com`). Invite action links are
  NEVER logged or returned in the response.
- Supabase's default invite email template is NOT used — we use
  `auth.admin.generateLink` so we can send our own Brokz-branded email.
