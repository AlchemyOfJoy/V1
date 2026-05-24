import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dispatchNotifications } from "@/lib/notifications/dispatch";

/**
 * Send a one-off test notification across every enabled channel for
 * the signed-in user. Used by the "Send me a test" button on the
 * settings page. Same idempotency rules as the cron path — but the
 * test send uses a synthetic kind so it doesn't collide with the
 * real day's morning_subscript record.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { kind?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const kind =
    typeof body.kind === "string" && body.kind.length < 64
      ? (body.kind as
          | "morning_subscript"
          | "evening_subscript"
          | "weekly_pillar"
          | "letter_delivered"
          | "milestone")
      : "morning_subscript";

  const summary = await dispatchNotifications({
    onlyUserId: user.id,
    forceKind: kind,
  });
  return NextResponse.json({ ok: true, summary });
}
