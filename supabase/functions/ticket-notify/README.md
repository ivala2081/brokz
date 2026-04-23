# ticket-notify

Sends a transactional email for a single ticket message. Direction is
determined automatically from the author's profile role:

- **Admin author** → notify customer (sent to `organizations.contact_email`)
- **Customer author** → notify admin team (sent to `CONTACT_TO_EMAIL`)

## Callers

1. **Admin UI (immediate path)** — after an admin posts a reply, it POSTs
   `{ ticket_id, message_id }` with the admin's access token so the
   customer gets notified without waiting on the queue drainer.
2. **Queue drainer (Phase 3)** — a future cron Edge Function will drain
   `public.ticket_notification_queue` (created by the trigger migration
   `20260422150000_ticket_notify_trigger.sql`) and call this function with
   the service-role bearer to notify admins of customer messages.

## Request

`POST /functions/v1/ticket-notify`

Headers:
- `Authorization: Bearer <admin access_token OR service_role key>` — REQUIRED
- `Content-Type: application/json`
- `apikey: <anon key>`

Body:
```json
{
  "ticket_id": "…uuid…",
  "message_id": "…uuid…",
  "locale": "tr"
}
```

## Response

```json
{
  "ok": true,
  "data": {
    "direction": "to-customer",
    "delivered": true
  }
}
```

`delivered: false` cases carry a `reason` field — `no_recipient_email`
or `email_failed`. The call itself still returns 200 so the caller does
not treat it as a retryable HTTP error (deliverability is best-effort
and the queue drainer will decide retry policy in Phase 3).

## Error codes

| Status | Cause |
|-------:|-------|
| 400 | Validation failed / invalid JSON |
| 401 | Missing bearer token |
| 403 | Non-admin caller with an authenticated JWT |
| 404 | ticket_id or message_id not found |
| 405 | Non-POST |
| 500 | DB / upstream error |

## Env vars

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL` — fallback admin inbox for customer→admin direction.
- `PUBLIC_SITE_URL`
- `ALLOWED_ORIGINS`

## Dependencies

- Migration `20260422150000_ticket_notify_trigger.sql` creates the
  `ticket_notification_queue` table + trigger. This function itself does
  NOT read from the queue (the Phase 3 drainer does); it only consumes
  a `{ ticket_id, message_id }` pair and sends the email.
