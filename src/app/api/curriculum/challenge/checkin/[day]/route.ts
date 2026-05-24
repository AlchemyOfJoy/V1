import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getCheckin,
  markChallengeCompleted,
  TOTAL_DAYS,
  upsertCheckin,
} from "@/lib/challenge";

function parseDay(s: string): number | null {
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n < 1 || n > TOTAL_DAYS) return null;
  return n;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ day: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { day } = await params;
  const dayNum = parseDay(day);
  if (dayNum === null)
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  const checkin = await getCheckin(user.id, dayNum);
  return NextResponse.json({ checkin });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ day: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { day } = await params;
  const dayNum = parseDay(day);
  if (dayNum === null)
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: Parameters<typeof upsertCheckin>[2] = {};
  if (typeof body.subscript_morning_done === "boolean")
    patch.subscript_morning_done = body.subscript_morning_done;
  if (typeof body.subscript_evening_done === "boolean")
    patch.subscript_evening_done = body.subscript_evening_done;
  if (typeof body.weekly_focus_action === "string")
    patch.weekly_focus_action = body.weekly_focus_action.slice(0, 500);
  if (typeof body.reflection === "string")
    patch.reflection = body.reflection.slice(0, 4000);
  if (
    typeof body.mood_rating === "number" &&
    body.mood_rating >= 0 &&
    body.mood_rating <= 10
  )
    patch.mood_rating = Math.round(body.mood_rating);

  try {
    const checkin = await upsertCheckin(user.id, dayNum, patch);
    // Cadence Directive §9 — Day 90 close triggers Practice Mode transition
    if (dayNum === TOTAL_DAYS) {
      await markChallengeCompleted(user.id);
    }
    return NextResponse.json({ checkin });
  } catch (err) {
    console.error("[challenge] checkin failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that check-in." },
      { status: 500 },
    );
  }
}
