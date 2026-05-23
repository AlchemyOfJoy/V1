import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createForgivenessSubject,
  listForgivenessSubjects,
} from "@/lib/forgiveness";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const subjects = await listForgivenessSubjects(user.id);
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { subject_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name =
    typeof body.subject_name === "string"
      ? body.subject_name.trim().slice(0, 120)
      : "";
  if (!name) {
    return NextResponse.json(
      { error: "Give this process a name — even &lsquo;myself&rsquo; works." },
      { status: 400 },
    );
  }

  try {
    const subject = await createForgivenessSubject(user.id, name);
    return NextResponse.json({ subject });
  } catch (err) {
    console.error("[forgiveness] create failed:", err);
    return NextResponse.json(
      { error: "We couldn't start that process." },
      { status: 500 },
    );
  }
}
