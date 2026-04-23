/**
 * Shared HTML layout primitives for Brokz transactional emails.
 *
 * Brand tokens (locked 2026-04-21):
 *   #00C033 brand, #009A29 hover, #5FDD82 accent,
 *   #050A06 ink, #F9FAFB bg.
 * Typography: Geist web font with system-ui fallback.
 *
 * Every template imports `renderShell` and `escapeHtml` from here so
 * chrome / footer / typography stay consistent across messages.
 */

export function escapeHtml(s: string | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type Locale = 'tr' | 'en';

export function pickLocale(locale: unknown): Locale {
  return locale === 'en' ? 'en' : 'tr';
}

const FOOTER_TR = 'Bu e-posta Brokz tarafından gönderilmiştir.';
const FOOTER_EN = 'This email was sent by Brokz.';

type ShellInput = {
  locale: Locale;
  subject: string;
  eyebrow: string;
  heading: string;
  bodyHtml: string;
};

/**
 * Wrap the given body in the branded shell. `bodyHtml` must be
 * pre-sanitized — layout does not escape it.
 */
export function renderShell({ locale, subject, eyebrow, heading, bodyHtml }: ShellInput): string {
  const langAttr = locale === 'en' ? 'en' : 'tr';
  const footer = locale === 'en' ? FOOTER_EN : FOOTER_TR;
  return `<!doctype html>
<html lang="${langAttr}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px;background:#F9FAFB;font-family:'Geist',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 32px 20px;background:#050A06;">
        <p style="margin:0 0 4px;color:#5FDD82;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(eyebrow)}</p>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(heading)}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;color:#050A06;font-size:14px;line-height:1.7;font-family:'Geist',system-ui,sans-serif;">
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 20px;background:#F9FAFB;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;font-family:'Geist Mono',ui-monospace,monospace;">
          ${escapeHtml(footer)}
        </p>
        <p style="margin:6px 0 0;color:#00C033;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:'Geist',system-ui,sans-serif;">Brokz Tech</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Standard CTA button, inline-styled for email clients.
 */
export function renderButton(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 20px;background:#00C033;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;font-family:'Geist',system-ui,sans-serif;letter-spacing:-0.01em;">${escapeHtml(label)}</a>
  </p>`;
}
