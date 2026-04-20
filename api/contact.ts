import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// ─── configuration ───────────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'brokztech@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Brokz <onboarding@resend.dev>';

// Validation limits
const LIMITS = {
  company: 120,
  name: 120,
  email: 160,
  type: 80,
  message: 5000,
};

const INQUIRY_TYPES = new Set([
  '',
  'Brokerage Infrastructure',
  'Trading Platform Development',
  'MT4/MT5 Plugins',
  'Algorithmic Trading Systems',
  'Risk & Execution Optimization',
  'Data Analytics',
  'Partnership',
  'Other',
]);

// ─── helpers ─────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function trim(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderHtml(data: {
  company: string;
  name: string;
  email: string;
  type: string;
  message: string;
}): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="padding:8px 0;color:#0f172a;font-size:14px;line-height:1.6;">${escapeHtml(value) || '<span style="color:#94a3b8;">—</span>'}</td>
    </tr>`;

  return `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 32px 20px;background:#050a06;">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Brokz — New Inquiry</p>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">${escapeHtml(data.type || 'General Inquiry')}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${row('Company', data.company)}
          ${row('Name', data.name)}
          ${row('Email', data.email)}
          ${row('Inquiry Type', data.type)}
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
        <p style="margin:0 0 10px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Message</p>
        <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e2e8f0;">
        <p style="margin:0;color:#94a3b8;font-size:11px;font-family:'Geist Mono',ui-monospace,monospace;">
          Reply directly to this email to respond to ${escapeHtml(data.name || 'sender')}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderText(data: {
  company: string;
  name: string;
  email: string;
  type: string;
  message: string;
}): string {
  return `NEW BROKZ INQUIRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Company:       ${data.company}
Name:          ${data.name}
Email:         ${data.email}
Inquiry Type:  ${data.type || 'General'}

MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply directly to this email to respond.
`;
}

// ─── handler ─────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Parse + validate
  const body = req.body ?? {};

  // Honeypot — real users never fill this
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    // Silently succeed (don't give bots feedback)
    return res.status(200).json({ ok: true });
  }

  const company = trim(body.company, LIMITS.company);
  const name = trim(body.name, LIMITS.name);
  const email = trim(body.email, LIMITS.email);
  const type = trim(body.type, LIMITS.type);
  const message = trim(body.message, LIMITS.message);

  const errors: Record<string, string> = {};
  if (!company) errors.company = 'Company is required';
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Invalid email';
  if (!message) errors.message = 'Message is required';
  if (message.length < 10) errors.message = 'Message too short (min 10 chars)';
  if (type && !INQUIRY_TYPES.has(type)) errors.type = 'Invalid inquiry type';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  // Send via Resend
  try {
    const resend = new Resend(RESEND_API_KEY);
    const subject = `Brokz Inquiry — ${type || 'General'} · ${company}`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject,
      html: renderHtml({ company, name, email, type, message }),
      text: renderText({ company, name, email, type, message }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(502).json({ error: 'Failed to send message. Please try again or email contact@brokz.io directly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Unexpected error. Please try again.' });
  }
}
