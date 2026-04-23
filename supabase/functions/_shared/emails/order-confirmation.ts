/**
 * Order-confirmation email. Sent after `admin-create-order` inserts a
 * pending order — informs the customer we received their purchase intent.
 */

import { escapeHtml, pickLocale, renderShell, type Locale } from './_layout.ts';

export type OrderConfirmationInput = {
  organizationName: string;
  productName: string;
  orderId: string;
  locale?: Locale | string;
};

export type OrderConfirmationOutput = {
  subject: string;
  html: string;
  text: string;
};

export function build(input: OrderConfirmationInput): OrderConfirmationOutput {
  const locale = pickLocale(input.locale);
  const { organizationName, productName, orderId } = input;

  const subject = locale === 'en'
    ? `Order received — ${productName}`
    : `Siparişiniz alındı — ${productName}`;

  const eyebrow = locale === 'en' ? 'Brokz — Order' : 'Brokz — Sipariş';
  const heading = locale === 'en' ? 'We have received your order' : 'Siparişiniz alındı';

  const bodyHtml = `
    <p style="margin:0 0 16px;">${locale === 'en'
      ? `Hello <strong>${escapeHtml(organizationName)}</strong>,`
      : `Merhaba <strong>${escapeHtml(organizationName)}</strong>,`}</p>
    <p style="margin:0 0 16px;">${locale === 'en'
      ? `We have received your order for <strong>${escapeHtml(productName)}</strong>. Our team will provision your licence shortly and notify you by email as soon as it is ready.`
      : `<strong>${escapeHtml(productName)}</strong> siparişinizi aldık. Ekibimiz lisansınızı kısa süre içinde hazırlayacak ve hazır olduğunda e-posta ile bilgilendireceğiz.`}</p>
    <table cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-family:'Geist',system-ui,sans-serif;">${locale === 'en' ? 'Order ID' : 'Sipariş No'}</td>
        <td style="padding:8px 0;color:#050A06;font-size:14px;font-family:'Geist Mono',ui-monospace,monospace;">${escapeHtml(orderId)}</td>
      </tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:12px;">${locale === 'en'
      ? 'Reply to this email if you have any questions.'
      : 'Sorularınız için bu e-postayı yanıtlayabilirsiniz.'}</p>
  `;

  const html = renderShell({ locale, subject, eyebrow, heading, bodyHtml });

  const text = locale === 'en'
    ? `Order received\n\nHello ${organizationName},\n\nWe have received your order for ${productName}. Order ID: ${orderId}.\n\nOur team will provision your licence shortly.\n\nBrokz Tech`
    : `Siparişiniz alındı\n\nMerhaba ${organizationName},\n\n${productName} siparişinizi aldık. Sipariş No: ${orderId}.\n\nEkibimiz lisansınızı kısa süre içinde hazırlayacak.\n\nBrokz Tech`;

  return { subject, html, text };
}
