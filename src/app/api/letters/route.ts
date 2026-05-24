import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

interface LetterRow {
  id: string;
  body: string;
  send_at: string | Date;
  sent_at: string | Date | null;
  opened_at: string | Date | null;
  created_at: string | Date;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // Mark any due letters as delivered on read (lightweight cron-less)
  await query(
    `UPDATE letters_to_self SET sent_at = now()
       WHERE user_id = $1 AND sent_at IS NULL AND send_at <= now()`,
    [user.id],
  );

  const letters = await query<LetterRow>(
    `SELECT id::text AS id, body, send_at, sent_at, opened_at, created_at
       FROM letters_to_self
       WHERE user_id = $1
       ORDER BY send_at DESC`,
    [user.id],
  );
  return NextResponse.json({ letters });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { body?: unknown; deliver_in_days?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const text =
    typeof body.body === "string" ? body.body.trim().slice(0, 20000) : "";
  if (!text)
    return NextResponse.json(
      { error: "Write something first." },
      { status: 400 },
    );
  const days =
    typeof body.deliver_in_days === "number" && body.deliver_in_days > 0
      ? Math.min(3650, Math.round(body.deliver_in_days))
      : 30;

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO letters_to_self (user_id, body, send_at)
       VALUES ($1, $2, now() + ($3 || ' days')::interval)
       RETURNING id::text AS id`,
      [user.id, text, String(days)],
    );
    return NextResponse.json({ id: rows[0].id, deliver_in_days: days });
  } catch (err) {
    console.error("[letters] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your letter." },
      { status: 500 },
    );
  }
}
