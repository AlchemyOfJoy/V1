import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { setChallengeMode, startChallenge } from "@/lib/challenge";

/**
 * Onboarding completion (Cadence Directive §1 / §10).
 *
 * The user has just walked the tutorial. The door they picked sets
 * their starting state:
 *
 *   "book"      → Challenge mode (with optional book sync later)
 *   "retreat"   → Practice mode (assumes some install already done)
 *   "challenge" → Challenge mode (full 90-Day arc)
 *   "explore"   → Free mode (no prescribed sequence)
 *
 * Falls back to Challenge if no door was selected — the directive's
 * default for new signups.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { door?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }
  const door = typeof body.door === "string" ? body.door : null;

  const mode =
    door === "explore"
      ? "free"
      : door === "retreat"
        ? "practice"
        : "challenge";

  try {
    await query(
      `UPDATE users
         SET curriculum_started_at = COALESCE(curriculum_started_at, now())
       WHERE id = $1`,
      [user.id],
    );
    await setChallengeMode(user.id, mode);
    if (mode === "challenge") {
      await startChallenge(user.id);
    }
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    console.error("[onboarding] complete failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again." },
      { status: 500 },
    );
  }
}
