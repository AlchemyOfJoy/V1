import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { flag?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const flag = typeof body.flag === "string" ? body.flag.trim() : "";
  if (!/^[a-z0-9_-]{1,64}$/i.test(flag)) {
    return NextResponse.json({ error: "Invalid flag." }, { status: 400 });
  }
  await query(
    `UPDATE users
       SET tutorial_flags = tutorial_flags || jsonb_build_object($2::text, true)
       WHERE id = $1`,
    [user.id, flag],
  );
  return NextResponse.json({ ok: true });
}
