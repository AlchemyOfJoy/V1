import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { QUESTIONS } from "@/lib/questions";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { answers?: unknown; note?: unknown };
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
  const score = (answers as number[]).reduce((sum, a) => sum + a, 0);
  const id = randomUUID();

  try {
    await query(
      `INSERT INTO assessments (id, user_id, score, answers, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, user.id, score, JSON.stringify(answers), note || null],
    );
    return NextResponse.json({ id, score });
  } catch (err) {
    console.error("[assessments] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your assessment. Please try again." },
      { status: 500 },
    );
  }
}
