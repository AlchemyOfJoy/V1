import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { query } from "@/lib/db";
import { ensureCoachProfile } from "@/lib/coaches";

/**
 * Admin-only: grant or revoke coach status, set certification phase,
 * toggle accepting-clients. Used from the Admin UI; coaches themselves
 * cannot self-promote.
 *
 * GET  — list all coaches
 * POST — promote a user to coach by email (creates profile row)
 * PATCH — update cert_status or accepting_clients
 */

export async function GET() {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const rows = await query<{
    id: string;
    email: string;
    name: string | null;
    cert_status: string | null;
    accepting_clients: boolean | null;
    capacity: number | null;
  }>(
    `SELECT u.id, u.email, u.name, cp.cert_status, cp.accepting_clients, cp.capacity
       FROM users u
       LEFT JOIN coach_profiles cp ON cp.user_id = u.id
      WHERE u.role = 'coach'
      ORDER BY u.created_at DESC`,
  );
  return NextResponse.json({ coaches: rows });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email)
    return NextResponse.json({ error: "Email required." }, { status: 400 });

  const userRows = await query<{ id: string }>(
    `SELECT id FROM users WHERE email = $1`,
    [email],
  );
  const userId = userRows[0]?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "No user with that email — they need to sign up first." },
      { status: 404 },
    );
  }

  await query(`UPDATE users SET role = 'coach' WHERE id = $1`, [userId]);
  const profile = await ensureCoachProfile(userId);
  return NextResponse.json({ ok: true, coach_id: userId, profile });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: {
    coach_id?: unknown;
    cert_status?: unknown;
    accepting_clients?: unknown;
    capacity?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.coach_id !== "string") {
    return NextResponse.json({ error: "Missing coach_id." }, { status: 400 });
  }

  const VALID_STATUSES = new Set([
    "phase_1_client",
    "phase_2_study",
    "phase_3_practice",
    "phase_4_supervised",
    "phase_5_interview",
    "certified",
    "inactive",
  ]);

  const sets: string[] = [];
  const params: unknown[] = [body.coach_id];
  if (
    typeof body.cert_status === "string" &&
    VALID_STATUSES.has(body.cert_status)
  ) {
    sets.push(`cert_status = $${params.length + 1}`);
    params.push(body.cert_status);
    if (body.cert_status === "certified") {
      sets.push(`certified_at = COALESCE(certified_at, now())`);
    }
  }
  if (typeof body.accepting_clients === "boolean") {
    sets.push(`accepting_clients = $${params.length + 1}`);
    params.push(body.accepting_clients);
  }
  if (typeof body.capacity === "number" && body.capacity >= 0) {
    sets.push(`capacity = $${params.length + 1}`);
    params.push(Math.round(body.capacity));
  }
  if (sets.length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  sets.push(`updated_at = now()`);
  await query(
    `UPDATE coach_profiles SET ${sets.join(", ")} WHERE user_id = $1`,
    params,
  );
  return NextResponse.json({ ok: true });
}
