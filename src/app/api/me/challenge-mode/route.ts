import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeStatus, setChallengeMode } from "@/lib/challenge";

/**
 * POST /api/me/challenge-mode — switch a user's state between
 * Challenge / Practice / Free (Cadence Directive §1).
 *
 * Switching INTO challenge starts the Challenge clock if it isn't
 * already running (handled inside setChallengeMode).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const mode = body.mode;
  if (mode !== "challenge" && mode !== "practice" && mode !== "free") {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  }
  await setChallengeMode(user.id, mode);
  const status = await getChallengeStatus(user.id);
  return NextResponse.json({ ok: true, status });
}
