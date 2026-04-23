/**
 * License-issued email. Sent by `admin-generate-license` after a license
 * row is inserted. The license key IS displayed here (prominent block) so
 * the customer can record it. It is ALSO available via the dashboard.
 *
 * This template is the ONLY place outside of a UI reveal where the full
 * key is rendered — the Edge Function MUST NOT log the key anywhere.
 */

import { escapeHtml, pickLocale, renderShell, type Locale } from './_layout.ts';

export type LicenseIssuedInput = {
  organizationName: string;
  productName: string;
  licenseKey: string;
  expiresAt?: string | Date | null;
  locale?: Locale | string;
};

export type LicenseIssuedOutput = {
  subject: string;
  html: string;
  text: string;
};

function formatDate(d: string | Date | null | undefined, locale: Locale): string {
  if (!d) return locale === 'en' ? 'No expiry' : 'Süresiz';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return locale === 'en' ? 'No expiry' : 'Süresiz';
  return date.toLocaleDateString(locale === 'en' ? 'en-GB' : 'tr-TR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}

export function build(input: LicenseIssuedInput): LicenseIssuedOutput {
  const locale = pickLocale(input.locale);
  const { organizationName, productName, licenseKey, expiresAt } = input;

  const subject = locale === 'en'
    ? `Your Brokz licence is ready — ${productName}`
    : `Brokz lisansınız hazır — ${productName}`;

  const eyebrow = locale === 'en' ? 'Brokz — Licence Issued' : 'Brokz — Lisans Aktif';
  const heading = locale === 'en' ? 'Your licence is active' : 'Lisansınız aktif';

  const bodyHtml = `
    <p style="margin:0 0 16px;">${locale === 'en'
      ? `Hello <strong>${escapeHtml(organizationName)}</strong>,`
      : `Merhaba <strong>${escapeHtml(organizationName)}</strong>,`}</p>
    <p style="margin:0 0 16px;">${locale === 'en'
      ? `Your licence for <strong>${escapeHtml(productName)}</strong> has been activated. Keep the key below in a secure location.`
      : `<strong>${escapeHtml(productName)}</strong> için lisansınız aktive edildi. Anahtarı güvenli bir yerde saklayın.`}</p>

    <div style="margin:20px 0;padding:18px 20px;background:#050A06;border-radius:10px;">
      <p style="margin:0 0 6px;color:#5FDD82;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Licence key' : 'Lisans anahtarı'}</p>
      <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.04em;font-family:'Geist Mono',ui-monospace,monospace;word-break:break-all;">${escapeHtml(licenseKey)}</p>
    </div>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Expires' : 'Son geçerlilik'}</td>
        <td style="padding:8px 0;color:#050A06;font-size:14px;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(formatDate(expiresAt ?? null, locale))}</td>
      </tr>
    </table>

    <p style="margin:0;color:#64748b;font-size:12px;">${locale === 'en'
      ? 'You can also view this licence at any time from your Brokz dashboard. Reply to this email if you need assistance.'
      : 'Bu lisansı istediğiniz zaman Brokz panelinizden de görüntüleyebilirsiniz. Yardım gerekirse bu e-postayı yanıtlayın.'}</p>
  `;

  const html = renderShell({ locale, subject, eyebrow, heading, bodyHtml });

  const text = locale === 'en'
    ? `Brokz licence issued\n\nHello ${organizationName},\n\nYour licence for ${productName} is active.\n\nLicence key: ${licenseKey}\nExpires: ${formatDate(expiresAt ?? null, locale)}\n\nKeep this key in a secure location.\n\nBrokz Tech`
    : `Brokz lisansı hazır\n\nMerhaba ${organizationName},\n\n${productName} için lisansınız aktif.\n\nLisans anahtarı: ${licenseKey}\nSon geçerlilik: ${formatDate(expiresAt ?? null, locale)}\n\nBu anahtarı güvenli bir yerde saklayın.\n\nBrokz Tech`;

  return { subject, html, text };
}
