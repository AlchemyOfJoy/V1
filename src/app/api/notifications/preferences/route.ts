import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getOrCreatePreferences,
  updatePreferences,
  type NotificationPreferences,
} from "@/lib/notifications/preferences";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const prefs = await getOrCreatePreferences(user.id);
  // Don't leak the unsubscribe token or raw push subscription
  const safe = {
    ...prefs,
    unsubscribe_token: undefined,
    push_subscription: prefs.push_subscription ? true : null,
  };
  return NextResponse.json({ preferences: safe });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: Partial<NotificationPreferences> = {};
  if (typeof body.push_enabled === "boolean") patch.push_enabled = body.push_enabled;
  if (typeof body.email_enabled === "boolean") patch.email_enabled = body.email_enabled;
  if (typeof body.sms_enabled === "boolean") patch.sms_enabled = body.sms_enabled;
  if (typeof body.email_address === "string")
    patch.email_address = body.email_address.trim().toLowerCase() || null;
  if (typeof body.phone_e164 === "string")
    patch.phone_e164 = normalizeE164(body.phone_e164);
  if (typeof body.morning_time === "string" && /^\d{2}:\d{2}$/.test(body.morning_time))
    patch.morning_time = body.morning_time;
  if (typeof body.evening_time === "string" && /^\d{2}:\d{2}$/.test(body.evening_time))
    patch.evening_time = body.evening_time;
  if (typeof body.timezone === "string") patch.timezone = body.timezone.slice(0, 64);

  for (const k of [
    "subscript_morning",
    "subscript_evening",
    "weekly_pillar",
    "letter_delivered",
    "gone_dark",
    "milestone",
  ] as const) {
    if (typeof body[k] === "boolean") patch[k] = body[k] as boolean;
  }

  // Disabling a channel should clear its subscription material so a
  // re-enable explicitly re-confirms.
  if (patch.push_enabled === false) patch.push_subscription = null;

  const saved = await updatePreferences(user.id, patch);
  const safe = {
    ...saved,
    unsubscribe_token: undefined,
    push_subscription: saved.push_subscription ? true : null,
  };
  return NextResponse.json({ preferences: safe });
}

function normalizeE164(s: string): string | null {
  const digits = s.replace(/[^\d+]/g, "");
  if (!digits) return null;
  // Permissive: must start with + and have 8-15 digits, per E.164.
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  // If no country code, assume US +1
  const onlyDigits = digits.replace(/\D/g, "");
  if (onlyDigits.length === 10) return `+1${onlyDigits}`;
  return null;
}
