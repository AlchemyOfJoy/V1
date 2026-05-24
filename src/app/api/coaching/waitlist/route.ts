import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { findPackage } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { package_id?: unknown; notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const packageId =
    typeof body.package_id === "string" && findPackage(body.package_id)
      ? body.package_id
      : null;
  const notes =
    typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : null;

  try {
    await query(
      `INSERT INTO coaching_waitlist (user_id, email, package_id, notes)
       VALUES ($1, $2, $3, $4)`,
      [user.id, user.email, packageId, notes],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] save failed:", err);
    return NextResponse.json(
      { error: "Couldn't add you to the list." },
      { status: 500 },
    );
  }
}
