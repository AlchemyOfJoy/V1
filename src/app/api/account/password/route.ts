import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUser,
  getUserById,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { current?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";
  if (next.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    const full = await getUserById(user.id);
    if (!full) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    if (full.password_hash) {
      if (!verifyPassword(current, full.password_hash)) {
        return NextResponse.json(
          { error: "Current password doesn't match." },
          { status: 400 },
        );
      }
    }
    const hash = hashPassword(next);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
      hash,
      user.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account/password] failed:", err);
    return NextResponse.json(
      { error: "Couldn't update your password." },
      { status: 500 },
    );
  }
}
