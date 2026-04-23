/**
 * Invitation email for a newly-created user. Sent by `admin-invite-user`
 * Edge Function after generating a magic-link via Supabase Auth admin API.
 *
 * The `inviteUrl` is the one-shot Supabase action link — treat as sensitive
 * and do NOT log it elsewhere.
 */

import { escapeHtml, pickLocale, renderShell, renderButton, type Locale } from './_layout.ts';

export type InviteUserInput = {
  inviteUrl: string;
  organizationName: string;
  inviterName?: string;
  locale?: Locale | string;
};

export type InviteUserOutput = {
  subject: string;
  html: string;
  text: string;
};

export function build(input: InviteUserInput): InviteUserOutput {
  const locale = pickLocale(input.locale);
  const orgName = input.organizationName || (locale === 'en' ? 'your organization' : 'kuruluşunuz');
  const inviterLine = input.inviterName
    ? (locale === 'en'
        ? `${input.inviterName} has invited you to join the Brokz workspace for <strong>${escapeHtml(orgName)}</strong>.`
        : `${escapeHtml(input.inviterName)} sizi <strong>${escapeHtml(orgName)}</strong> için Brokz çalışma alanına davet etti.`)
    : (locale === 'en'
        ? `You have been invited to join the Brokz workspace for <strong>${escapeHtml(orgName)}</strong>.`
        : `<strong>${escapeHtml(orgName)}</strong> için Brokz çalışma alanına davet edildiniz.`);

  const subject = locale === 'en'
    ? `You are invited to Brokz — ${orgName}`
    : `Brokz davetiniz — ${orgName}`;

  const eyebrow = locale === 'en' ? 'Brokz — Invitation' : 'Brokz — Davet';
  const heading = locale === 'en' ? 'Join your Brokz workspace' : 'Brokz hesabınızı etkinleştirin';
  const cta = locale === 'en' ? 'Set password & sign in' : 'Şifre belirle ve giriş yap';
  const fallbackLine = locale === 'en'
    ? 'If the button does not work, copy and paste this link into your browser:'
    : 'Buton çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:';
  const expiryLine = locale === 'en'
    ? 'This invite link is single-use and expires shortly. Contact us if it is no longer valid.'
    : 'Bu davet bağlantısı tek kullanımlıktır ve kısa sürede sona erer. Geçersiz olursa bizimle iletişime geçin.';

  const bodyHtml = `
    <p style="margin:0 0 16px;">${inviterLine}</p>
    <p style="margin:0 0 8px;">${locale === 'en'
      ? 'Click the button below to set your password and access the dashboard.'
      : 'Aşağıdaki butona tıklayarak şifrenizi belirleyip panele erişebilirsiniz.'}</p>
    ${renderButton(input.inviteUrl, cta)}
    <p style="margin:0 0 8px;color:#64748b;font-size:12px;">${fallbackLine}</p>
    <p style="margin:0 0 20px;word-break:break-all;"><a href="${escapeHtml(input.inviteUrl)}" style="color:#00C033;">${escapeHtml(input.inviteUrl)}</a></p>
    <p style="margin:0;color:#64748b;font-size:12px;">${expiryLine}</p>
  `;

  const html = renderShell({ locale, subject, eyebrow, heading, bodyHtml });

  const text = locale === 'en'
    ? `Brokz invitation\n\n${input.inviterName ? `${input.inviterName} has invited you` : 'You have been invited'} to join the Brokz workspace for ${orgName}.\n\nSet your password:\n${input.inviteUrl}\n\nThis link is single-use and expires shortly.\n\nBrokz Tech`
    : `Brokz daveti\n\n${input.inviterName ? `${input.inviterName} sizi` : 'Sizi'} ${orgName} için Brokz çalışma alanına davet etti.\n\nŞifrenizi belirleyin:\n${input.inviteUrl}\n\nBu bağlantı tek kullanımlıktır ve kısa sürede sona erer.\n\nBrokz Tech`;

  return { subject, html, text };
}
