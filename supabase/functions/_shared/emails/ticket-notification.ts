/**
 * Ticket notification email. Sent by the `ticket-notify` Edge Function on
 * every new ticket_messages row (either customer→admin or admin→customer).
 *
 * The `messagePreview` is truncated by the caller — this template does NOT
 * re-truncate. It is HTML-escaped here.
 */

import { escapeHtml, pickLocale, renderShell, renderButton, type Locale } from './_layout.ts';

export type TicketNotificationDirection = 'to-admin' | 'to-customer';

export type TicketNotificationInput = {
  subject: string;
  organizationName: string;
  messagePreview: string;
  ticketUrl: string;
  direction: TicketNotificationDirection;
  locale?: Locale | string;
};

export type TicketNotificationOutput = {
  subject: string;
  html: string;
  text: string;
};

export function build(input: TicketNotificationInput): TicketNotificationOutput {
  const locale = pickLocale(input.locale);
  const { subject: ticketSubject, organizationName, messagePreview, ticketUrl, direction } = input;

  const isToAdmin = direction === 'to-admin';

  const subject = isToAdmin
    ? (locale === 'en'
        ? `[Brokz] New message — ${ticketSubject} (${organizationName})`
        : `[Brokz] Yeni mesaj — ${ticketSubject} (${organizationName})`)
    : (locale === 'en'
        ? `[Brokz] Reply from support — ${ticketSubject}`
        : `[Brokz] Destek ekibinden yanıt — ${ticketSubject}`);

  const eyebrow = locale === 'en' ? 'Brokz — Support' : 'Brokz — Destek';
  const heading = isToAdmin
    ? (locale === 'en' ? 'New customer message' : 'Yeni müşteri mesajı')
    : (locale === 'en' ? 'New reply on your ticket' : 'Destek talebinize yeni yanıt');
  const cta = locale === 'en' ? 'Open ticket' : 'Talebi aç';

  const bodyHtml = `
    ${isToAdmin ? `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="padding:4px 16px 4px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Organization' : 'Kuruluş'}</td>
        <td style="padding:4px 0;color:#050A06;font-size:14px;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(organizationName)}</td>
      </tr>
      <tr>
        <td style="padding:4px 16px 4px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Subject' : 'Konu'}</td>
        <td style="padding:4px 0;color:#050A06;font-size:14px;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(ticketSubject)}</td>
      </tr>
    </table>
    ` : `
    <p style="margin:0 0 12px;">${locale === 'en' ? 'Subject' : 'Konu'}: <strong>${escapeHtml(ticketSubject)}</strong></p>
    `}
    <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Message' : 'Mesaj'}</p>
    <p style="margin:0 0 16px;padding:16px;background:#F9FAFB;border-left:3px solid #00C033;border-radius:4px;color:#050A06;font-size:14px;line-height:1.7;white-space:pre-wrap;font-family:'Geist',system-ui,sans-serif;">${escapeHtml(messagePreview)}</p>
    ${renderButton(ticketUrl, cta)}
  `;

  const html = renderShell({ locale, subject, eyebrow, heading, bodyHtml });

  const text = (isToAdmin
    ? `${locale === 'en' ? 'New customer message' : 'Yeni müşteri mesajı'}\n\n${locale === 'en' ? 'Organization' : 'Kuruluş'}: ${organizationName}\n${locale === 'en' ? 'Subject' : 'Konu'}: ${ticketSubject}\n\n${messagePreview}\n\n${locale === 'en' ? 'Open ticket' : 'Talebi aç'}: ${ticketUrl}`
    : `${locale === 'en' ? 'Reply on your Brokz ticket' : 'Brokz talebinize yanıt'}\n\n${locale === 'en' ? 'Subject' : 'Konu'}: ${ticketSubject}\n\n${messagePreview}\n\n${locale === 'en' ? 'View online' : 'Çevrimiçi görüntüle'}: ${ticketUrl}`
  ) + '\n\nBrokz Tech';

  return { subject, html, text };
}
