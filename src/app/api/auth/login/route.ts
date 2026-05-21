import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getUserByEmail,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`login:${clientIp(req)}`, 10, 600))) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  try {
    const user = await getUserByEmail(email);
    if (
      !user ||
      !user.password_hash ||
      !verifyPassword(password, user.password_hash)
    ) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[login] failed:", err);
    return NextResponse.json(
      { error: "We couldn't sign you in right now. Please try again in a moment." },
      { status: 500 },
    );
  }
}
