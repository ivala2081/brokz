# admin-issue-invoice

Admin-only Edge Function that issues an invoice for an order. Atomic
per-year invoice number allocation via the `next_invoice_number(year)`
RPC. Sends a branded invoice-issued email with a dashboard link.

## Request

`POST /functions/v1/admin-issue-invoice`

Headers:
- `Authorization: Bearer <admin access_token>` — REQUIRED
- `Content-Type: application/json`
- `apikey: <anon key>`

Body:
```json
{
  "order_id": "…uuid…",
  "due_at": "2026-05-22T00:00:00Z",
  "locale": "tr"
}
```

## Response

Success (200):
```json
{
  "ok": true,
  "data": {
    "invoice_id": "…uuid…",
    "invoice_number": "BRKZ-2026-000001"
  }
}
```

Idempotent re-call (existing active invoice for this order):
```json
{
  "ok": true,
  "data": {
    "invoice_id": "…uuid…",
    "invoice_number": "BRKZ-2026-000001",
    "reused": true
  }
}
```

## Error codes

| Status | Cause |
|-------:|-------|
| 400 | Validation failed |
| 401 | Missing / invalid token |
| 403 | Caller is not admin |
| 404 | Order not found or soft-deleted |
| 405 | Non-POST |
| 500 | DB / upstream error (incl. number allocator failure) |

## Env vars

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `ALLOWED_ORIGINS`
- `PUBLIC_SITE_URL` — used to build the dashboard link in the email.

## Dependencies

- Migration `20260422140000_invoice_number_sequence.sql` MUST be applied
  before deploy — it creates `public.invoice_counters` and the atomic
  `public.next_invoice_number(int)` RPC.

## curl

```bash
curl -X POST \
  "$SUPABASE_URL/functions/v1/admin-issue-invoice" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "…",
    "due_at": "2026-05-22T00:00:00Z",
    "locale": "tr"
  }'
```

## Notes on numbering

- Format: `BRKZ-YYYY-NNNNNN` (zero-padded to 6 digits).
- Counter is per calendar year (UTC) and advances monotonically; cancelled
  invoices (soft-deleted via `deleted_at`) do NOT free their number.
  Gap-free accounting is not a current Brokz requirement — only monotonic.
- The RPC is atomic: an upsert-with-increment runs in a single statement,
  so concurrent callers cannot collide.
