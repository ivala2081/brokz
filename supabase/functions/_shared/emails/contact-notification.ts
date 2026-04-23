/**
 * Admin notification email for a new contact-form lead.
 *
 * Brand colors (locked 2026-04-21): #00C033 brand, #050A06 ink, #F9FAFB bg.
 * Typography: Geist web font with system-ui fallback.
 *
 * Returns `{ subject, html, text }` — all strings are pre-escaped where they
 * come from user input.
 */

export type ContactNotificationInput = {
  company: string;
  name: string;
  email: string;
  type: string;
  message: string;
  source?: string;
  ip?: string;
};

export type ContactNotificationOutput = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderContactNotification(
  input: ContactNotificationInput,
): ContactNotificationOutput {
  const { company, name, email, type, message, source, ip } = input;

  const subject = `Yeni İletişim Talebi: ${company || name || email}`;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;white-space:nowrap;font-family:'Geist',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${label}</td>
      <td style="padding:8px 0;color:#050A06;font-size:14px;line-height:1.6;font-family:'Geist',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${escapeHtml(value) || '<span style="color:#94a3b8;">—</span>'}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px;background:#F9FAFB;font-family:'Geist',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 32px 20px;background:#050A06;">
        <p style="margin:0 0 4px;color:#5FDD82;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;font-family:'Geist',system-ui,sans-serif;">Brokz — Yeni Talep</p>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(type || 'Genel Talep')}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${row('Şirket', company)}
          ${row('İsim', name)}
          ${row('E-posta', email)}
          ${row('Talep Tipi', type)}
          ${source ? row('Kaynak', source) : ''}
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
        <p style="margin:0 0 10px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:'Geist',system-ui,sans-serif;">Mesaj</p>
        <p style="margin:0;color:#050A06;font-size:14px;line-height:1.7;white-space:pre-wrap;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(message)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F9FAFB;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;font-family:'Geist Mono',ui-monospace,monospace;">
          ${ip ? `IP: ${escapeHtml(ip)} · ` : ''}Yanıt vermek için bu e-postayı doğrudan yanıtlayın — alıcı ${escapeHtml(name || email)}.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 32px 20px;background:#F9FAFB;">
        <p style="margin:0;color:#00C033;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:'Geist',system-ui,sans-serif;">Brokz Tech</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `YENİ BROKZ TALEBİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Şirket:       ${company}
İsim:         ${name}
E-posta:      ${email}
Talep Tipi:   ${type || 'Genel'}
${source ? `Kaynak:       ${source}\n` : ''}${ip ? `IP:           ${ip}\n` : ''}
MESAJ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Yanıt vermek için bu e-postayı doğrudan yanıtlayın.
`;

  return { subject, html, text };
}
