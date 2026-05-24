import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteConversation,
  getConversation,
  listMessages,
} from "@/lib/coach/conversations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const conversation = await getConversation(user.id, id);
  if (!conversation)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  const messages = await listMessages(id);
  return NextResponse.json({ conversation, messages });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const ok = await deleteConversation(user.id, id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
