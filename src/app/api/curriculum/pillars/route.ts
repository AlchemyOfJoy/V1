import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listSnapshots, saveSnapshot, type PillarScores } from "@/lib/pillars";
import { PILLAR_KEYS, type PriorityPillarKey } from "@/lib/curriculum";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const snapshots = await listSnapshots(user.id);
  return NextResponse.json({ snapshots });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { scores?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof body.scores !== "object" ||
    body.scores === null ||
    Array.isArray(body.scores)
  ) {
    return NextResponse.json(
      { error: "Scores must be an object." },
      { status: 400 },
    );
  }
  const raw = body.scores as Record<string, unknown>;
  const clean: PillarScores = {};
  for (const k of PILLAR_KEYS) {
    const v = raw[k];
    if (typeof v === "number" && v >= 0 && v <= 10) {
      clean[k as PriorityPillarKey] = Math.round(v);
    }
  }

  try {
    const snap = await saveSnapshot(user.id, clean);
    return NextResponse.json({ snapshot: snap });
  } catch (err) {
    console.error("[pillars] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your snapshot." },
      { status: 500 },
    );
  }
}
