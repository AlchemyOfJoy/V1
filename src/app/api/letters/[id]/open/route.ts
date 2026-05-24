import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  await query(
    `UPDATE letters_to_self SET opened_at = COALESCE(opened_at, now())
       WHERE id = $1::bigint AND user_id = $2 AND send_at <= now()`,
    [id, user.id],
  );
  return NextResponse.json({ ok: true });
}
