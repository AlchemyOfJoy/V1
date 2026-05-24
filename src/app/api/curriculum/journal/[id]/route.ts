import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteJournalEntry } from "@/lib/journal";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  try {
    const ok = await deleteJournalEntry(user.id, id);
    if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[journal] delete failed:", err);
    return NextResponse.json(
      { error: "We couldn't remove that entry." },
      { status: 500 },
    );
  }
}
