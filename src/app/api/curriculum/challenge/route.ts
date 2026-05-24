import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getChallengeStatus,
  resetChallenge,
  startChallenge,
} from "@/lib/challenge";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const status = await getChallengeStatus(user.id);
  return NextResponse.json({ status });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  let body: { action?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // empty body == start
  }
  try {
    if (body.action === "reset") {
      await resetChallenge(user.id);
    } else {
      await startChallenge(user.id);
    }
    const status = await getChallengeStatus(user.id);
    return NextResponse.json({ status });
  } catch (err) {
    console.error("[challenge] start/reset failed:", err);
    return NextResponse.json(
      { error: "We couldn't start the challenge." },
      { status: 500 },
    );
  }
}
