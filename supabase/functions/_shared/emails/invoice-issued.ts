/**
 * Invoice-issued email. Sent by `admin-issue-invoice` after an invoice
 * row is created. Links back to the dashboard invoice view.
 */

import { escapeHtml, pickLocale, renderShell, renderButton, type Locale } from './_layout.ts';

export type InvoiceIssuedInput = {
  organizationName: string;
  invoiceNumber: string;
  amount: number | string;
  currency: string;
  dueAt?: string | Date | null;
  invoiceUrl: string;
  locale?: Locale | string;
};

export type InvoiceIssuedOutput = {
  subject: string;
  html: string;
  text: string;
};

function formatDate(d: string | Date | null | undefined, locale: Locale): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale === 'en' ? 'en-GB' : 'tr-TR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}

function formatMoney(amount: number | string, currency: string, locale: Locale): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function build(input: InvoiceIssuedInput): InvoiceIssuedOutput {
  const locale = pickLocale(input.locale);
  const { organizationName, invoiceNumber, amount, currency, dueAt, invoiceUrl } = input;

  const subject = locale === 'en'
    ? `Invoice ${invoiceNumber} from Brokz`
    : `Brokz faturası ${invoiceNumber}`;

  const eyebrow = locale === 'en' ? 'Brokz — Invoice' : 'Brokz — Fatura';
  const heading = locale === 'en' ? 'Your invoice is ready' : 'Faturanız hazır';

  const bodyHtml = `
    <p style="margin:0 0 16px;">${locale === 'en'
      ? `Hello <strong>${escapeHtml(organizationName)}</strong>,`
      : `Merhaba <strong>${escapeHtml(organizationName)}</strong>,`}</p>
    <p style="margin:0 0 16px;">${locale === 'en'
      ? `Your invoice <strong>${escapeHtml(invoiceNumber)}</strong> has been issued.`
      : `<strong>${escapeHtml(invoiceNumber)}</strong> numaralı faturanız düzenlendi.`}</p>
    <table cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Amount' : 'Tutar'}</td>
        <td style="padding:8px 0;color:#050A06;font-size:14px;font-weight:700;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(formatMoney(amount, currency, locale))}</td>
      </tr>
      <tr>
        <td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Due by' : 'Son ödeme'}</td>
        <td style="padding:8px 0;color:#050A06;font-size:14px;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(formatDate(dueAt ?? null, locale))}</td>
      </tr>
    </table>
    ${renderButton(invoiceUrl, locale === 'en' ? 'View invoice' : 'Faturayı görüntüle')}
    <p style="margin:0;color:#64748b;font-size:12px;">${locale === 'en'
      ? 'If you have any questions about this invoice, simply reply to this email.'
      : 'Fatura ile ilgili sorularınız için bu e-postayı yanıtlayabilirsiniz.'}</p>
  `;

  const html = renderShell({ locale, subject, eyebrow, heading, bodyHtml });

  const text = locale === 'en'
    ? `Invoice ${invoiceNumber}\n\nHello ${organizationName},\n\nAmount: ${formatMoney(amount, currency, locale)}\nDue by: ${formatDate(dueAt ?? null, locale)}\n\nView online: ${invoiceUrl}\n\nBrokz Tech`
    : `Fatura ${invoiceNumber}\n\nMerhaba ${organizationName},\n\nTutar: ${formatMoney(amount, currency, locale)}\nSon ödeme: ${formatDate(dueAt ?? null, locale)}\n\nÇevrimiçi görüntüle: ${invoiceUrl}\n\nBrokz Tech`;

  return { subject, html, text };
}
