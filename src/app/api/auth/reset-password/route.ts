import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { query } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { consumePasswordReset } from "@/lib/password-reset";

/**
 * Consume a reset token + set a new password. On success: invalidate
 * every existing session for the user (sign them out everywhere — the
 * attacker, if any, is logged out too) and sign this device back in
 * fresh.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`reset:${clientIp(req)}`, 10, 600))) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: { token?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const consumed = await consumePasswordReset(token);
  if (!consumed) {
    return NextResponse.json(
      { error: "This link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  try {
    await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [
      consumed.userId,
      hashPassword(password),
    ]);
    // Invalidate all existing sessions — log the user (and any attacker)
    // out everywhere.
    await query(`DELETE FROM sessions WHERE user_id = $1`, [consumed.userId]);
    // Sign this device back in fresh.
    const session = await createSessionToken(consumed.userId);
    await setSessionCookie(session);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password] failed:", err);
    return NextResponse.json(
      { error: "We couldn't update that. Try again in a moment." },
      { status: 500 },
    );
  }
}
