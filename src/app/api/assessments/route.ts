import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { QUESTIONS } from "@/lib/questions";
import { awardBadge } from "@/lib/badges";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { answers?: unknown; note?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const answers = body.answers;
  if (
    !Array.isArray(answers) ||
    answers.length !== QUESTIONS.length ||
    !answers.every((a) => Number.isInteger(a) && a >= 1 && a <= 5)
  ) {
    return NextResponse.json(
      { error: "Please answer every question." },
      { status: 400 },
    );
  }

  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;
  const VALID_CONTEXTS = new Set([
    "baseline",
    "month_1",
    "month_2",
    "month_3",
    "final",
    "ad_hoc",
  ]);
  const context =
    typeof body.context === "string" && VALID_CONTEXTS.has(body.context)
      ? body.context
      : "ad_hoc";
  const score = (answers as number[]).reduce((sum, a) => sum + a, 0);
  const id = randomUUID();

  try {
    await query(
      `INSERT INTO assessments (id, user_id, score, answers, note, context)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, user.id, score, JSON.stringify(answers), note || null, context],
    );
    try {
      const rows = await query<{ c: string; max_score: number | null }>(
        `SELECT COUNT(*)::text AS c, MAX(score) FILTER (WHERE id <> $2) AS max_score
           FROM assessments WHERE user_id = $1`,
        [user.id, id],
      );
      const count = Number(rows[0]?.c ?? 0);
      if (count === 1) {
        await awardBadge(user.id, "jq_baseline");
        // First-ever JQ score = JOS Component 01 installed.
        const { markComponentInstalled } = await import("@/lib/jos");
        await markComponentInstalled(user.id, "jq_baseline");
      }
      const prevMax = rows[0]?.max_score;
      if (prevMax !== null && prevMax !== undefined && score > prevMax) {
        await awardBadge(user.id, "jq_rise");
      }
    } catch {
      // best-effort
    }
    return NextResponse.json({ id, score });
  } catch (err) {
    console.error("[assessments] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your assessment. Please try again." },
      { status: 500 },
    );
  }
}
