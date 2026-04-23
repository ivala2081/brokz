# contact-lead-capture

Public contact-form endpoint for brokztech.com. Replaces the legacy
Vercel serverless function at `api/contact.ts` so the frontend can move
onto Node-less shared hosting.

## Responsibilities

1. Accept POST with the contact form JSON payload.
2. Validate with Zod (matches `astro/src/components/ContactPageContent.tsx` exactly).
3. Honeypot + IP rate-limit (5 hits / 10 min).
4. Insert a row into `public.leads` via the `service_role` client.
5. Send an admin notification email via Resend (branded, Turkish subject).

## Payload

```json
{
  "company": "Acme Capital",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "type": "Brokerage Infrastructure",
  "message": "We are interested in a white-label B-Book stack.",
  "consent": true,
  "source": "contact_form",
  "website": ""
}
```

- `type` must be empty OR one of the values in `INQUIRY_TYPES` in `index.ts`.
- `website` (or `hp`) is the honeypot — real users leave it blank.
- `source` is optional (e.g. "landing_hero", "pricing_page").

## Local development

```bash
# From the Brokz repo root:
supabase functions serve contact-lead-capture --env-file ./supabase/.env.local
```

Example `supabase/.env.local`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role>
RESEND_API_KEY=<resend_key>
ALLOWED_ORIGINS=http://localhost:4321,https://brokztech.com
CONTACT_TO_EMAIL=brokztech@gmail.com
CONTACT_FROM_EMAIL=Brokz <onboarding@resend.dev>
```

## Deploy

```bash
supabase functions deploy contact-lead-capture
```

Then set the env vars on the Supabase dashboard
(Project → Edge Functions → contact-lead-capture → Secrets):

- `RESEND_API_KEY`
- `ALLOWED_ORIGINS`
- `CONTACT_TO_EMAIL` *(optional — defaults to brokztech@gmail.com)*
- `CONTACT_FROM_EMAIL` *(optional — defaults to the Resend test sender)*

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically
by the Supabase edge runtime — do not set them manually.

## Database

Requires `public.leads` (already created in
`supabase/migrations/20260422120000_foundation.sql`) and
`public.rate_limits` (added in
`supabase/migrations/20260422130000_rate_limits.sql`).

## Manual test

```bash
curl -X POST \
  "$SUPABASE_URL/functions/v1/contact-lead-capture" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4321" \
  -d '{
    "company": "Acme Capital",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "type": "Brokerage Infrastructure",
    "message": "Testing the Supabase Edge Function contact pipeline.",
    "consent": true,
    "website": ""
  }'
```

Expected response on success:

```json
{ "ok": true }
```

On validation failure:

```json
{ "ok": false, "error": "Validation failed", "fields": { "email": "Invalid email" } }
```

## Logs

Every outcome is logged as a single JSON line on `stdout`. Fields:

- `fn` — always `contact-lead-capture`
- `ts` — ISO timestamp
- `ip` — caller IP
- `outcome` — one of `success`, `validation_failed`, `honeypot_triggered`,
  `rate_limited`, `lead_insert_failed`, `email_failed_but_lead_saved`,
  `bad_json`, `rate_limit_check_failed`, `rate_limit_exception`
- `email_id` — on success, the Resend message id

Never logs the message body or the caller's email.
