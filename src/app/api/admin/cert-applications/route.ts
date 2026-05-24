import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { query } from "@/lib/db";
import { approveApplication, listPending } from "@/lib/cert-applications";
import { ensureCoachProfile } from "@/lib/coaches";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const applications = await listPending();
  return NextResponse.json({ applications });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: { application_id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.application_id !== "string") {
    return NextResponse.json({ error: "Missing application id." }, { status: 400 });
  }

  if (body.action === "approve") {
    const result = await approveApplication(body.application_id, admin.id);
    if (!result) {
      return NextResponse.json(
        { error: "Couldn't approve — already actioned or not found." },
        { status: 400 },
      );
    }
    // Promote the user to coach role and seed their profile in phase_1_client.
    await query(`UPDATE users SET role = 'coach' WHERE id = $1`, [result.user_id]);
    await ensureCoachProfile(result.user_id);
    return NextResponse.json({ ok: true, user_id: result.user_id });
  }

  if (body.action === "reject") {
    await query(
      `UPDATE cert_applications
          SET status = 'rejected', updated_at = now()
        WHERE id = $1::bigint`,
      [body.application_id],
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
