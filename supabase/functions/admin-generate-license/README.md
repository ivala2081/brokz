# admin-generate-license

Admin-only Edge Function that issues a license key for an order. Inserts
a `licenses` row, flips `orders.status` from `pending` to `active` if
needed, and emails the customer the full key.

## Request

`POST /functions/v1/admin-generate-license`

Headers:
- `Authorization: Bearer <admin access_token>` — REQUIRED
- `Content-Type: application/json`
- `apikey: <anon key>`

Body:
```json
{
  "order_id": "…uuid…",
  "expires_at": "2027-04-22T00:00:00Z",
  "locale": "tr"
}
```

- `expires_at` is optional. When omitted the license expires +365 days
  from now.

## Response

Success (200):
```json
{
  "ok": true,
  "data": {
    "license_id": "…uuid…",
    "license_key": "BRKZ-XXXX-XXXX-XXXX-XXXX-XXXX",
    "expires_at": "2027-04-22T00:00:00.000Z"
  }
}
```

**`license_key` is sensitive.** It is returned ONCE to the admin UI so
the operator can paste it manually if the email fails. After this
response the raw key is only retrievable by querying the DB under RLS
policies (customer sees own org; admin sees all).

## Error codes

| Status | Cause |
|-------:|-------|
| 400 | Validation failed; order status not in (pending, active) |
| 401 | Missing / invalid token |
| 403 | Caller is not admin |
| 404 | order_id not found or soft-deleted |
| 405 | Non-POST |
| 409 | Order already fully licensed for its `quantity` |
| 500 | DB / generator error |

## Env vars

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `ALLOWED_ORIGINS`

## curl

```bash
curl -X POST \
  "$SUPABASE_URL/functions/v1/admin-generate-license" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "order_id": "…", "locale": "tr" }'
```

## Security notes

- The raw license key is NEVER written to `console.log` — only the masked
  form (`BRKZ-****-****-****-****-XXXX`) appears in structured logs or
  in the `audit_log.diff` payload.
- DB `licenses.license_key` has a unique index; the generator retries up
  to 3× on collision (which is statistically impossible with 20 chars of
  CSPRNG output over a 32-symbol alphabet but handled defensively).
- Multiple licenses per order are supported up to `orders.quantity`.
