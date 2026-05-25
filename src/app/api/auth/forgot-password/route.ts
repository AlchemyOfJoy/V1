import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createPasswordReset } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/auth-email";

/**
 * Request a password reset email. Always returns ok — we never reveal
 * whether an account exists for the given email. Rate-limited per IP
 * to prevent enumeration + abuse.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`forgot:${clientIp(req)}`, 5, 600))) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Best effort — never fail the response on send errors, never reveal
  // whether the user exists. Either path returns ok.
  try {
    const user = await getUserByEmail(email);
    if (user) {
      const { url } = await createPasswordReset(user.id);
      await sendPasswordResetEmail({ to: email, url }).catch((err) =>
        console.error("[forgot-password] send failed:", err),
      );
    }
  } catch (err) {
    console.error("[forgot-password] failed:", err);
  }

  return NextResponse.json({ ok: true });
}
