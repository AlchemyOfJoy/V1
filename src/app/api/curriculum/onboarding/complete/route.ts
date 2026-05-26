import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { setChallengeMode } from "@/lib/challenge";
import { beginJosInstall } from "@/lib/jos";

/**
 * Onboarding completion (JOS-First Architecture §3, §13).
 *
 * After Day 0 onboarding, every new user enters the JOS install phase.
 * The "door" the user picked during onboarding is recorded as a hint
 * for later — but the path choice (Challenge vs Practice) happens AFTER
 * the install completes, not before. There are no skips per §16.
 *
 * The "explore" door no longer routes to Free Mode at onboarding —
 * those users still install the JOS; they just may pick Practice Mode
 * (Path B) at the post-JOS choice instead of the Challenge.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    await req.json();
  } catch {
    // body is optional now — the door is informational
  }

  try {
    await query(
      `UPDATE users
         SET curriculum_started_at = COALESCE(curriculum_started_at, now())
       WHERE id = $1`,
      [user.id],
    );
    await setChallengeMode(user.id, "jos_install");
    await beginJosInstall(user.id);
    return NextResponse.json({ ok: true, mode: "jos_install" });
  } catch (err) {
    console.error("[onboarding] complete failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again." },
      { status: 500 },
    );
  }
}
