import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { startChallenge } from "@/lib/challenge";

/**
 * Onboarding completion → auto-start the 90-Day Challenge.
 *
 * Every user from this point forward is on Day 1 of the structured
 * 90-day arc. The challenge is the spine of how the app is used; no
 * more separate "Begin Day 1" opt-in.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    await query(
      `UPDATE users
         SET curriculum_started_at = COALESCE(curriculum_started_at, now())
       WHERE id = $1`,
      [user.id],
    );
    await startChallenge(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding] complete failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again." },
      { status: 500 },
    );
  }
}
