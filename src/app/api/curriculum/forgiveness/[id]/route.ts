import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  completeForgivenessSubject,
  deleteForgivenessSubject,
  FORGIVENESS_FIELDS,
  getForgivenessSubject,
  updateForgivenessSubject,
  type ForgivenessField,
} from "@/lib/forgiveness";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const subject = await getForgivenessSubject(user.id, id);
  if (!subject)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ subject });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: Partial<Record<ForgivenessField | "subject_name", string>> = {};
  if (typeof body.subject_name === "string") {
    const n = body.subject_name.trim().slice(0, 120);
    if (!n)
      return NextResponse.json(
        { error: "Name can't be empty." },
        { status: 400 },
      );
    patch.subject_name = n;
  }
  for (const field of FORGIVENESS_FIELDS) {
    if (typeof body[field] === "string") {
      patch[field] = (body[field] as string).slice(0, 20000);
    }
  }

  try {
    const subject = await updateForgivenessSubject(user.id, id, patch);
    if (!subject)
      return NextResponse.json({ error: "Not found." }, { status: 404 });

    if (body.complete === true) {
      const done = await completeForgivenessSubject(user.id, id);
      return NextResponse.json({ subject: done ?? subject });
    }
    return NextResponse.json({ subject });
  } catch (err) {
    console.error("[forgiveness] update failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  try {
    const ok = await deleteForgivenessSubject(user.id, id);
    if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgiveness] delete failed:", err);
    return NextResponse.json(
      { error: "We couldn't remove that." },
      { status: 500 },
    );
  }
}
