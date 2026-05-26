import { siteUrl } from "./site";

/**
 * Transactional email sender for auth flows (password reset).
 *
 * Uses Resend's HTTP API directly so there's no SDK dependency, and so
 * the auth path doesn't import the notification-channel stack (which
 * carries cron / dispatch machinery).
 *
 * No-op if RESEND_API_KEY isn't set so dev / preview environments don't
 * fail — the email content is logged to the console instead.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendPasswordResetEmail(opts: {
  to: string;
  url: string;
}): Promise<{ sent: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Alchemy of Joy <hello@alchemyofjoy.com>";

  const subject = "Reset your Alchemy of Joy password";
  const html = renderHtml(opts.url);
  const text =
    `Someone — hopefully you — asked to reset the password on your\n` +
    `Alchemy of Joy account. Tap the link below within the next hour:\n\n` +
    `${opts.url}\n\n` +
    `If you didn't request this, ignore this email and nothing changes.\n\n` +
    `— ${siteUrl()}`;

  if (!key) {
    console.info(
      `[auth-email] no RESEND_API_KEY — would have sent reset link to ${opts.to}:\n${opts.url}`,
    );
    return { sent: false };
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: opts.to, subject, html, text }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
  return { sent: true };
}

function renderHtml(url: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#FAF7F1;font-family:Georgia,serif;color:#00171F;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;">
    <tr><td style="padding:24px 28px;background:#ffffff;border-radius:24px;">
      <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#008CB8;">
        The Alchemy of Joy
      </p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.25;color:#00171F;">
        Reset your password.
      </h1>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:rgba(0,23,31,0.78);">
        Someone — hopefully you — asked to reset the password on your
        Alchemy of Joy account. Tap below within the next hour to choose
        a new one.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block;padding:12px 22px;background:#008CB8;color:#ffffff;text-decoration:none;border-radius:999px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.02em;">
          Set a new password →
        </a>
      </p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(0,23,31,0.55);line-height:1.6;">
        If you didn't request this, ignore this email — nothing will change.
        The link expires in one hour.
      </p>
    </td></tr>
  </table>
</body></html>`;
}
