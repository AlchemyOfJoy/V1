import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { logJoyPulse, recentPulses } from "@/lib/joy-pulse";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const pulses = await recentPulses(user.id, 30);
  return NextResponse.json({ pulses });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { score?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const score = Number(body.score);
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    return NextResponse.json(
      { error: "Score must be 1–10." },
      { status: 400 },
    );
  }
  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;
  try {
    const pulse = await logJoyPulse(user.id, score, note);
    return NextResponse.json({ pulse });
  } catch (err) {
    console.error("[joy-pulse] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't log that pulse." },
      { status: 500 },
    );
  }
}
