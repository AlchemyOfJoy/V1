import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  createUser,
  getUserByEmail,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { startChallenge } from "@/lib/challenge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`signup:${clientIp(req)}`, 8, 900))) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  try {
    if (await getUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const user = await createUser({
      email,
      name: name || null,
      passwordHash: hashPassword(password),
    });
    // Auto-start the 90-Day Challenge so the user is on Day 1 from the
    // very first sign-in. Onboarding completes it as well; this is the
    // safety net for users who skip the tutorial.
    await startChallenge(user.id);
    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[signup] failed:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't create your account right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
