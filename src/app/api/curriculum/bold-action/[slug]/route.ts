import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  BOLD_ACTION_SLUGS,
  journalIdForTool,
} from "@/lib/bold-action";
import {
  addJournalEntry,
  listJournalEntries,
} from "@/lib/journal";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { slug } = await params;
  if (!BOLD_ACTION_SLUGS.has(slug))
    return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
  const entries = await listJournalEntries(user.id, journalIdForTool(slug), 20);
  return NextResponse.json({ entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { slug } = await params;
  if (!BOLD_ACTION_SLUGS.has(slug))
    return NextResponse.json({ error: "Unknown tool." }, { status: 400 });

  let body: { body?: unknown; title?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const text =
    typeof body.body === "string" ? body.body.trim().slice(0, 8000) : "";
  if (!text) {
    return NextResponse.json(
      { error: "Add a note before logging." },
      { status: 400 },
    );
  }
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 200) : null;

  try {
    const entry = await addJournalEntry(user.id, text, {
      worksheetId: journalIdForTool(slug),
      title,
    });
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[bold-action] log failed:", err);
    return NextResponse.json(
      { error: "We couldn't log that." },
      { status: 500 },
    );
  }
}
