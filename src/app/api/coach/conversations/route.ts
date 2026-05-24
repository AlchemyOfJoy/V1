import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listConversations } from "@/lib/coach/conversations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const conversations = await listConversations(user.id);
  return NextResponse.json({ conversations });
}
