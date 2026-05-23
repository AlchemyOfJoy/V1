import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

interface SubscriptRow {
  id: string;
  target_date: string | Date | null;
  manifestations: string[];
  affirmations: string[];
  emotion_anchor: string | null;
  version: number;
  is_active: boolean;
  created_at: string | Date;
}

function cleanStringArray(input: unknown, max = 12, maxLen = 280): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => (typeof v === "string" ? v.trim().slice(0, maxLen) : ""))
    .filter((s) => s.length > 0)
    .slice(0, max);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const rows = await query<SubscriptRow>(
    `SELECT id, target_date, manifestations, affirmations, emotion_anchor,
            version, is_active, created_at
       FROM subscripts
      WHERE user_id = $1
      ORDER BY version DESC
      LIMIT 10`,
    [user.id],
  );
  return NextResponse.json({ subscripts: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: {
    target_date?: unknown;
    manifestations?: unknown;
    affirmations?: unknown;
    emotion_anchor?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const targetDate =
    typeof body.target_date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.target_date)
      ? body.target_date
      : null;
  const manifestations = cleanStringArray(body.manifestations);
  const affirmations = cleanStringArray(body.affirmations);
  const emotionAnchor =
    typeof body.emotion_anchor === "string"
      ? body.emotion_anchor.trim().slice(0, 2000)
      : null;

  try {
    // Deactivate prior, bump version.
    const next = await query<{ next_version: number }>(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
         FROM subscripts WHERE user_id = $1`,
      [user.id],
    );
    const version = next[0]?.next_version ?? 1;
    await query(
      `UPDATE subscripts SET is_active = false WHERE user_id = $1`,
      [user.id],
    );
    const rows = await query<SubscriptRow>(
      `INSERT INTO subscripts
         (user_id, target_date, manifestations, affirmations,
          emotion_anchor, version, is_active)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, true)
       RETURNING id, target_date, manifestations, affirmations,
                 emotion_anchor, version, is_active, created_at`,
      [
        user.id,
        targetDate,
        JSON.stringify(manifestations),
        JSON.stringify(affirmations),
        emotionAnchor,
        version,
      ],
    );
    return NextResponse.json({ subscript: rows[0] });
  } catch (err) {
    console.error("[subscript] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your SubScript." },
      { status: 500 },
    );
  }
}
