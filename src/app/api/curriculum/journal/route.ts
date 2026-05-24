import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addJournalEntry } from "@/lib/journal";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { body?: unknown; title?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text =
    typeof body.body === "string" ? body.body.trim().slice(0, 20000) : "";
  if (!text) {
    return NextResponse.json(
      { error: "Write something before saving." },
      { status: 400 },
    );
  }
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 200) : null;

  try {
    const entry = await addJournalEntry(user.id, text, {
      worksheetId: "freeform",
      title,
    });
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[journal] save failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that entry." },
      { status: 500 },
    );
  }
}
