import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getWorksheetResponse,
  markWorksheetComplete,
  saveWorksheetResponse,
} from "@/lib/worksheets";
import { WORKSHEET_IDS } from "@/lib/curriculum";

const ALLOWED = new Set<string>(Object.values(WORKSHEET_IDS));

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  if (!ALLOWED.has(id)) {
    return NextResponse.json(
      { error: "Unknown worksheet." },
      { status: 400 },
    );
  }

  let body: { data?: unknown; complete?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof body.data !== "object" ||
    body.data === null ||
    Array.isArray(body.data)
  ) {
    return NextResponse.json(
      { error: "Worksheet data must be an object." },
      { status: 400 },
    );
  }

  try {
    await saveWorksheetResponse(
      user.id,
      id,
      body.data as Record<string, unknown>,
    );
    if (body.complete === true) {
      await markWorksheetComplete(user.id, id);
    }
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[worksheet] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your worksheet. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  if (!ALLOWED.has(id))
    return NextResponse.json({ error: "Unknown worksheet." }, { status: 400 });

  const row = await getWorksheetResponse(user.id, id);
  return NextResponse.json({
    data: row?.data ?? {},
    completedAt: row?.completed_at ?? null,
  });
}
