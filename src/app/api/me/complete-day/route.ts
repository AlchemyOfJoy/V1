import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getChallengeStatus,
  markChallengeCompleted,
  TOTAL_DAYS,
  upsertCheckin,
} from "@/lib/challenge";
import { query } from "@/lib/db";

/**
 * Mark a Challenge day complete + return next-day info for the
 * "advance" UX (Challenge Content Directive §5).
 *
 * Body:
 *   { day: number, advanceImmediately?: boolean }
 *
 * Response:
 *   {
 *     ok: true,
 *     dayCompleted: number,
 *     nextDay: number | null,
 *     isMonthEnd: boolean,        // 28 or 56
 *     isFinalDay: boolean,         // 90
 *     showAccelerationWarning: boolean,  // sustained acceleration detected
 *     warningPreviouslyShown: boolean
 *   }
 *
 * Idempotent — calling twice on the same day is a no-op upsert.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { day?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const day = Number(body.day);
  if (!Number.isFinite(day) || day < 1 || day > TOTAL_DAYS) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }

  await upsertCheckin(user.id, day, {
    // Minimal complete — the user has just confirmed "today's anchor
    // is done". Per-field state (subscript flags, reflection) is
    // captured separately if the user opens the longer Day Check-in.
  });

  if (day === TOTAL_DAYS) {
    await markChallengeCompleted(user.id);
  }

  // Re-read status for current/next/expected day
  const status = await getChallengeStatus(user.id);
  const nextDay = day < TOTAL_DAYS ? day + 1 : null;
  const isMonthEnd = day === 28 || day === 56;
  const isFinalDay = day === TOTAL_DAYS;

  // Accelerated pacing detection (§5). Heuristic: if the user has
  // completed 7+ days but their challenge started <= 4 calendar days
  // ago, that's a sustained doubling-up. Show the gentle warning
  // exactly once.
  const accel = await query<{
    days_started: number;
    days_done: number;
    warning_shown: boolean;
  }>(
    `SELECT
       GREATEST(1, EXTRACT(DAY FROM (now() - challenge_started_at))::int + 1)
         AS days_started,
       (SELECT COUNT(*) FROM challenge_checkins WHERE user_id = u.id)
         AS days_done,
       accelerated_warning_shown AS warning_shown
     FROM users u WHERE u.id = $1`,
    [user.id],
  );
  const a = accel[0];
  const showAccelerationWarning =
    !!a &&
    !a.warning_shown &&
    Number(a.days_done) >= 7 &&
    Number(a.days_done) >= Number(a.days_started) * 2;

  if (showAccelerationWarning) {
    await query(
      `UPDATE users SET accelerated_warning_shown = true WHERE id = $1`,
      [user.id],
    );
  }

  return NextResponse.json({
    ok: true,
    dayCompleted: day,
    nextDay,
    isMonthEnd,
    isFinalDay,
    showAccelerationWarning,
    warningPreviouslyShown: a?.warning_shown ?? false,
    currentDay: status.current_day,
  });
}
