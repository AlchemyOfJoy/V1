import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createApplication,
  getMyApplication,
  markPaid,
} from "@/lib/cert-applications";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const application = await getMyApplication(user.id);
  return NextResponse.json({ application });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const existing = await getMyApplication(user.id);
  if (existing && existing.status !== "rejected") {
    return NextResponse.json(
      {
        error:
          "You already have an application on file. Status: " +
          existing.status,
      },
      { status: 409 },
    );
  }

  let body: { story?: unknown; experience?: unknown; why_aoj?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const story =
    typeof body.story === "string" ? body.story.trim().slice(0, 8000) : "";
  const experience =
    typeof body.experience === "string"
      ? body.experience.trim().slice(0, 8000)
      : "";
  const whyAoj =
    typeof body.why_aoj === "string"
      ? body.why_aoj.trim().slice(0, 8000)
      : "";
  if (!story || !experience || !whyAoj) {
    return NextResponse.json(
      { error: "All three fields required." },
      { status: 400 },
    );
  }

  try {
    const app = await createApplication(user.id, {
      story,
      experience,
      why_aoj: whyAoj,
    });
    return NextResponse.json({ application: app });
  } catch (err) {
    console.error("[cert-apply] failed:", err);
    return NextResponse.json(
      { error: "Couldn't save your application." },
      { status: 500 },
    );
  }
}

/**
 * Phase 2 placeholder: marks the application as "paid" without an
 * actual Stripe charge. Replace this body with Stripe Checkout in
 * Phase 3 once Brent has Stripe Connect approved + API keys set.
 */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { application_id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.action !== "mock_pay") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  const app = await getMyApplication(user.id);
  if (!app)
    return NextResponse.json({ error: "No application." }, { status: 404 });

  await markPaid(app.id);
  return NextResponse.json({ ok: true });
}
