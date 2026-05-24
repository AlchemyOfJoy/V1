import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getTodayLoop,
  upsertEvening,
  upsertMorning,
} from "@/lib/itt-loops";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const loop = await getTodayLoop(user.id);
  return NextResponse.json({ loop });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: {
    phase?: "morning" | "evening";
    intention?: unknown;
    thought?: unknown;
    action?: unknown;
    action_status?: unknown;
    evening_notes?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    if (body.phase === "evening") {
      const allowedStatus = new Set(["yes", "partial", "not_yet"]);
      const status =
        typeof body.action_status === "string" &&
        allowedStatus.has(body.action_status)
          ? (body.action_status as "yes" | "partial" | "not_yet")
          : undefined;
      const loop = await upsertEvening(user.id, {
        action_status: status,
        evening_notes:
          typeof body.evening_notes === "string"
            ? body.evening_notes.trim().slice(0, 1000)
            : undefined,
      });
      return NextResponse.json({ loop });
    }
    const patch: Parameters<typeof upsertMorning>[1] = {};
    if (typeof body.intention === "string")
      patch.intention = body.intention.trim().slice(0, 500);
    if (typeof body.thought === "string")
      patch.thought = body.thought.trim().slice(0, 500);
    if (typeof body.action === "string")
      patch.action = body.action.trim().slice(0, 500);
    const loop = await upsertMorning(user.id, patch);
    return NextResponse.json({ loop });
  } catch (err) {
    console.error("[itt-loop] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that loop." },
      { status: 500 },
    );
  }
}
