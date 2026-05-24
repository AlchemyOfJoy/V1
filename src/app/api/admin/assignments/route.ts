import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: { user_email?: unknown; coach_email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const userEmail =
    typeof body.user_email === "string"
      ? body.user_email.trim().toLowerCase()
      : "";
  if (!userEmail)
    return NextResponse.json({ error: "User email required." }, { status: 400 });
  const coachEmail =
    typeof body.coach_email === "string"
      ? body.coach_email.trim().toLowerCase()
      : "";

  if (!coachEmail) {
    // Unassign back to BrentBot
    const rows = await query<{ id: string }>(
      `UPDATE users SET coach_id = NULL WHERE email = $1 RETURNING id`,
      [userEmail],
    );
    if (rows.length === 0)
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ ok: true, coach: null });
  }

  // Validate the coach is certified
  const coach = await query<{
    id: string;
    role: string;
    cert_status: string | null;
  }>(
    `SELECT u.id, u.role, cp.cert_status
       FROM users u
       LEFT JOIN coach_profiles cp ON cp.user_id = u.id
      WHERE u.email = $1`,
    [coachEmail],
  );
  if (coach.length === 0 || coach[0].role !== "coach") {
    return NextResponse.json(
      { error: "Coach not found or not promoted to coach role." },
      { status: 404 },
    );
  }
  if (coach[0].cert_status !== "certified") {
    return NextResponse.json(
      { error: "Coach is not yet certified." },
      { status: 400 },
    );
  }

  const updated = await query<{ id: string }>(
    `UPDATE users SET coach_id = $1 WHERE email = $2 RETURNING id`,
    [coach[0].id, userEmail],
  );
  if (updated.length === 0)
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ ok: true, coach_id: coach[0].id });
}
