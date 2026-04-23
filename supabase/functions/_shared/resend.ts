/**
 * Resend email helper — Edge Function (Deno) runtime.
 *
 * Thin wrapper around Resend's REST API. We deliberately do NOT use the
 * `resend` npm package here; the raw HTTP call is trivial, Deno-native,
 * and removes a dependency from the Edge bundle.
 */

// @ts-ignore — `Deno` global exists at runtime on Supabase edge
declare const Deno: { env: { get(key: string): string | undefined } };

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not configured' };
  }

  const from =
    input.from ?? Deno.env.get('CONTACT_FROM_EMAIL') ?? 'Brokz <onboarding@resend.dev>';

  const payload: Record<string, unknown> = {
    from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
  };
  if (input.text) payload.text = input.text;
  if (input.replyTo) payload.reply_to = input.replyTo;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
          ? body.message
          : `Resend API error (status ${res.status})`);
      return { ok: false, error: message };
    }

    const id = body && typeof body === 'object' && 'id' in body && typeof body.id === 'string'
      ? body.id
      : 'unknown';
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Resend network error',
    };
  }
}
