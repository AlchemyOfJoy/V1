import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

/** Mark onboarding complete — only sets the timestamp the first time. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    await query(
      `UPDATE users
         SET curriculum_started_at = COALESCE(curriculum_started_at, now())
       WHERE id = $1`,
      [user.id],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding] complete failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again." },
      { status: 500 },
    );
  }
}
