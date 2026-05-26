import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  promptForToday,
  saveEveningPulse,
  saveEveningReflection,
  saveIntention,
} from "@/lib/intentions";

export const dynamic = "force-dynamic";

/**
 * Save today's morning intention OR an evening reflection / pulse.
 *
 * Body shapes:
 *   { kind: "intention", text: string, prompt?: string }
 *   { kind: "reflection", text: string }
 *   { kind: "pulse", score: number }
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { kind?: unknown; text?: unknown; prompt?: unknown; score?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = body.kind;
  if (kind === "intention") {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "Write something." }, { status: 400 });
    }
    const prompt =
      typeof body.prompt === "string" ? body.prompt : promptForToday(user.id);
    await saveIntention(user.id, text, prompt);
    return NextResponse.json({ ok: true });
  }
  if (kind === "reflection") {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "Write something." }, { status: 400 });
    }
    await saveEveningReflection(user.id, text);
    return NextResponse.json({ ok: true });
  }
  if (kind === "pulse") {
    const score = Number(body.score);
    if (!Number.isFinite(score) || score < 1 || score > 10) {
      return NextResponse.json({ error: "Score 1-10." }, { status: 400 });
    }
    await saveEveningPulse(user.id, score);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown kind." }, { status: 400 });
}
