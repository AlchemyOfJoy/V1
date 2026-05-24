import { siteUrl } from "../site";
import type { NotificationCopy } from "./copy";

/**
 * Email delivery via Resend's HTTP API. No SDK dep — plain fetch.
 *
 * Env vars:
 *   RESEND_API_KEY
 *   EMAIL_FROM    (e.g. "Alchemy of Joy <hello@alchemyofjoy.com>")
 *
 * If RESEND_API_KEY is not set, sends are no-ops returning success so
 * dev environments don't fail. The cron logs distinguish a real send
 * from a dev no-op via the returned status.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(opts: {
  to: string;
  copy: NotificationCopy;
  unsubscribeUrl: string;
}): Promise<{ sent: boolean; id?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Alchemy of Joy <hello@alchemyofjoy.com>";

  if (!key) {
    console.info(
      `[notifications/email] no RESEND_API_KEY — skipping send to ${opts.to}: ${opts.copy.email.subject}`,
    );
    return { sent: false };
  }

  const html = renderHtml(opts.copy, opts.unsubscribeUrl);
  const text = `${opts.copy.email.heading}\n\n${opts.copy.email.body}\n\n${siteUrl()}${opts.copy.url}\n\n— The Alchemy of Joy\n\nNo longer want these? ${opts.unsubscribeUrl}`;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.copy.email.subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${opts.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { sent: true, id: data.id };
}

function renderHtml(copy: NotificationCopy, unsubscribeUrl: string): string {
  const url = siteUrl() + copy.url;
  return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#FAF7F1;font-family:Georgia,serif;color:#00171F;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;">
    <tr><td style="padding:24px 28px;background:#ffffff;border-radius:24px;">
      <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#008CB8;">
        The Alchemy of Joy
      </p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.25;color:#00171F;">
        ${escapeHtml(copy.email.heading)}
      </h1>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:rgba(0,23,31,0.78);">
        ${escapeHtml(copy.email.body)}
      </p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block;padding:12px 22px;background:#008CB8;color:#ffffff;text-decoration:none;border-radius:999px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.02em;">
          Open the app →
        </a>
      </p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(0,23,31,0.45);">
        Quiet by design. <a href="${unsubscribeUrl}" style="color:rgba(0,23,31,0.55);">Turn these off</a> any time.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
