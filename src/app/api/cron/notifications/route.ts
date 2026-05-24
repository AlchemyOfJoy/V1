import { NextRequest, NextResponse } from "next/server";
import { dispatchNotifications } from "@/lib/notifications/dispatch";

/**
 * Cron entry point — invoked by Vercel cron (see vercel.json) every 15
 * minutes. Idempotent: each (user, kind, send_date, channel) tuple is
 * unique, so duplicate triggers are silent no-ops.
 *
 * Authentication: either the Vercel cron header (`x-vercel-cron`) or
 * a shared secret in `CRON_SECRET`. Reject everything else.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const summary = await dispatchNotifications();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error("[cron/notifications]", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

// POST is also accepted so Vercel Cron, GitHub Actions, or curl can trigger.
export async function POST(req: NextRequest) {
  return GET(req);
}

function authorized(req: NextRequest): boolean {
  // Vercel cron sets x-vercel-cron in production
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // In local dev allow without a secret so we can curl /api/cron/notifications.
    return process.env.NODE_ENV !== "production";
  }
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(req.url).searchParams.get("secret") ??
    "";
  return provided === secret;
}
