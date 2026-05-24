import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  isShared,
  revokeShare,
  shareWithCoach,
  type ResourceKind,
} from "@/lib/sharing";

const VALID_KINDS = new Set<string>([
  "worksheet",
  "forgiveness",
  "list_of_joy",
  "journal",
  "subscript_active",
  "pillar_snapshot",
  "jq_history",
  "challenge_progress",
]);

/**
 * POST /api/sharing — toggle a share with the user's assigned coach.
 * Body: { resource_type, resource_id, action: "share" | "revoke" }.
 *
 * If the user has no assigned coach (coach_id NULL = BrentBot), the
 * call returns 400 with a friendly message — BrentBot doesn't need
 * sharing grants because it's the user's own AI and reads everything
 * the user has written through the system prompt context layer.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { resource_type?: unknown; resource_id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.resource_type !== "string" || !VALID_KINDS.has(body.resource_type)) {
    return NextResponse.json({ error: "Unknown resource type." }, { status: 400 });
  }
  if (typeof body.resource_id !== "string" || body.resource_id.length === 0) {
    return NextResponse.json({ error: "Missing resource id." }, { status: 400 });
  }
  const action = body.action === "revoke" ? "revoke" : "share";

  const rows = await query<{ coach_id: string | null }>(
    `SELECT coach_id FROM users WHERE id = $1`,
    [user.id],
  );
  const coachId = rows[0]?.coach_id;
  if (!coachId) {
    return NextResponse.json(
      {
        error:
          "You're with BrentBot right now — no sharing needed; it already sees the context. Sharing applies once you're paired with a human coach.",
      },
      { status: 400 },
    );
  }

  try {
    if (action === "share") {
      const grant = await shareWithCoach(
        user.id,
        coachId,
        body.resource_type as ResourceKind,
        body.resource_id,
      );
      return NextResponse.json({ ok: true, grant });
    }
    const removed = await revokeShare(
      user.id,
      coachId,
      body.resource_type as ResourceKind,
      body.resource_id,
    );
    return NextResponse.json({ ok: removed });
  } catch (err) {
    console.error("[sharing] toggle failed:", err);
    return NextResponse.json({ error: "Couldn't update." }, { status: 500 });
  }
}

/** GET /api/sharing?resource_type=…&resource_id=… — is this item shared? */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("resource_type");
  const id = searchParams.get("resource_id");
  if (!type || !id || !VALID_KINDS.has(type)) {
    return NextResponse.json({ error: "Bad params." }, { status: 400 });
  }
  const rows = await query<{ coach_id: string | null }>(
    `SELECT coach_id FROM users WHERE id = $1`,
    [user.id],
  );
  const coachId = rows[0]?.coach_id;
  if (!coachId) return NextResponse.json({ shared: false, coachKind: "brentbot" });
  const shared = await isShared(
    user.id,
    coachId,
    type as ResourceKind,
    id,
  );
  return NextResponse.json({ shared, coachKind: "human" });
}
