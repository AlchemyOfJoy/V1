import { NextRequest, NextResponse } from "next/server";
import { clearSession, getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { confirm?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.confirm !== user.email) {
    return NextResponse.json(
      { error: "Type your email exactly to confirm." },
      { status: 400 },
    );
  }
  try {
    // ON DELETE CASCADE on every child table cleans up automatically.
    await query(`DELETE FROM users WHERE id = $1`, [user.id]);
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account/delete] failed:", err);
    return NextResponse.json(
      { error: "Couldn't delete your account." },
      { status: 500 },
    );
  }
}
