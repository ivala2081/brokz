#!/usr/bin/env bash
# Sets all 5 Brokz Edge Function secrets in one shot.
# Usage:
#   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx bash scripts/set-edge-function-secrets.sh
#
# Get a PAT at: https://supabase.com/dashboard/account/tokens

set -euo pipefail

PROJECT_REF="${BROKZ_SUPABASE_PROJECT_REF:-hzwqlbgqhqyqnqajvwee}"
PAT="${SUPABASE_ACCESS_TOKEN:-}"
RESEND_KEY="${RESEND_API_KEY:-}"
PUBLIC_SITE="${PUBLIC_SITE_URL:-http://localhost:4322}"
ALLOWED="${ALLOWED_ORIGINS:-http://localhost:4322,http://localhost:4321}"
FROM_EMAIL="${CONTACT_FROM_EMAIL:-onboarding@resend.dev}"
TO_EMAIL="${CONTACT_TO_EMAIL:-brokztech@gmail.com}"

if [ -z "$PAT" ] || [ -z "$RESEND_KEY" ]; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN and RESEND_API_KEY must both be set." >&2
  echo "Get a PAT at https://supabase.com/dashboard/account/tokens, then run:" >&2
  echo "  SUPABASE_ACCESS_TOKEN=sbp_xxx RESEND_API_KEY=re_xxx bash scripts/set-edge-function-secrets.sh" >&2
  exit 1
fi

PAYLOAD=$(cat <<JSON
[
  { "name": "RESEND_API_KEY",     "value": "$RESEND_KEY" },
  { "name": "ALLOWED_ORIGINS",    "value": "$ALLOWED" },
  { "name": "PUBLIC_SITE_URL",    "value": "$PUBLIC_SITE" },
  { "name": "CONTACT_FROM_EMAIL", "value": "$FROM_EMAIL" },
  { "name": "CONTACT_TO_EMAIL",   "value": "$TO_EMAIL" }
]
JSON
)

echo "Setting 5 Edge Function secrets on project $PROJECT_REF..."
HTTP_CODE=$(curl -sS -o /tmp/sb-secrets.out -w "%{http_code}" \
  -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/secrets" \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "OK (HTTP $HTTP_CODE). Secrets are live."
else
  echo "FAILED (HTTP $HTTP_CODE):" >&2
  cat /tmp/sb-secrets.out >&2
  echo "" >&2
  exit 1
fi
