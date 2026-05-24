import { NextRequest, NextResponse } from "next/server";
import {
  disableAllChannels,
  getPreferencesByUnsubscribeToken,
} from "@/lib/notifications/preferences";

/**
 * One-click unsubscribe (RFC 8058). Email "List-Unsubscribe-Post" header
 * points at this route; mail clients call POST to disable. We also
 * accept GET so a user can click the footer link in any email or SMS.
 */
export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }
  const prefs = await getPreferencesByUnsubscribeToken(token);
  if (!prefs) {
    return new NextResponse(
      htmlPage(
        "Already unsubscribed",
        "This link is no longer active. You won't receive notifications.",
      ),
      { status: 200, headers: { "Content-Type": "text/html" } },
    );
  }
  await disableAllChannels(prefs.user_id);
  return new NextResponse(
    htmlPage(
      "Notifications turned off",
      "All push, email and SMS notifications are now off. You can re-enable any of them from Me → Notifications any time.",
    ),
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}

function htmlPage(title: string, body: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:48px 24px;background:#FAF7F1;font-family:Georgia,serif;color:#00171F;text-align:center;">
  <div style="max-width:460px;margin:0 auto;background:#fff;padding:32px;border-radius:24px;">
    <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#008CB8;">
      The Alchemy of Joy
    </p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;">${title}</h1>
    <p style="margin:0;font-size:16px;line-height:1.65;color:rgba(0,23,31,0.78);">${body}</p>
  </div>
</body></html>`;
}
