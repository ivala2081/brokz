# admin-create-order

Admin-only Edge Function that inserts a `pending` order for an
organization. Sends an order-confirmation email to the organization's
contact email (best effort — the call succeeds even if the email fails).

## Request

`POST /functions/v1/admin-create-order`

Headers:
- `Authorization: Bearer <admin access_token>` — REQUIRED
- `Content-Type: application/json`
- `apikey: <anon key>`

Body:
```json
{
  "organization_id": "…uuid…",
  "product_id": "…uuid…",
  "quantity": 1,
  "unit_price": 2500.00,
  "notes": "Signed quote #Q-2026-042",
  "locale": "tr"
}
```

## Response

Success (200):
```json
{ "ok": true, "data": { "order_id": "…uuid…" } }
```

## Error codes

| Status | Cause |
|-------:|-------|
| 400 | Validation failed / organization not active / product not active |
| 401 | Missing / invalid token |
| 403 | Caller is not admin |
| 404 | organization_id or product_id not found |
| 405 | Non-POST |
| 500 | DB / upstream error |

## Env vars

Same as `admin-invite-user` minus `PUBLIC_SITE_URL` (not needed for this function):
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `ALLOWED_ORIGINS`

## curl

```bash
curl -X POST \
  "$SUPABASE_URL/functions/v1/admin-create-order" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "…",
    "product_id": "…",
    "quantity": 1,
    "unit_price": 2500,
    "locale": "tr"
  }'
```

## Notes

- `total` is computed server-side (`quantity × unit_price`, rounded to
  2 decimals) — never trust a client-sent `total`.
- `currency` is inherited from the product.
- `created_by` is set to the admin's profile id, enabling attribution in
  the Admin UI without the UI passing an explicit value.
