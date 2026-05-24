import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "Name required." }, { status: 400 });
  }
  const name = body.name.trim().slice(0, 120) || null;
  try {
    await query(`UPDATE users SET name = $1 WHERE id = $2`, [name, user.id]);
    return NextResponse.json({ ok: true, name });
  } catch (err) {
    console.error("[account/profile] failed:", err);
    return NextResponse.json(
      { error: "Couldn't update your profile." },
      { status: 500 },
    );
  }
}
