import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updatePreferences } from "@/lib/notifications/preferences";
import { publicVapidKey } from "@/lib/notifications/web-push";

export const dynamic = "force-dynamic";

/** Hand the browser the VAPID public key so it can subscribe. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const key = publicVapidKey();
  if (!key) {
    return NextResponse.json(
      { error: "Web push not configured on the server." },
      { status: 503 },
    );
  }
  return NextResponse.json({ publicKey: key });
}

/** Save the user's PushSubscription on the server. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { subscription?: { endpoint?: unknown; keys?: unknown } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const sub = body.subscription;
  if (
    !sub ||
    typeof sub.endpoint !== "string" ||
    !sub.keys ||
    typeof (sub.keys as { p256dh?: unknown }).p256dh !== "string" ||
    typeof (sub.keys as { auth?: unknown }).auth !== "string"
  ) {
    return NextResponse.json(
      { error: "Subscription is malformed." },
      { status: 400 },
    );
  }
  await updatePreferences(user.id, {
    push_enabled: true,
    push_subscription: sub as unknown as null,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await updatePreferences(user.id, {
    push_enabled: false,
    push_subscription: null,
  });
  return NextResponse.json({ ok: true });
}
