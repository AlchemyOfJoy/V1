import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getUserByEmail,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
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
