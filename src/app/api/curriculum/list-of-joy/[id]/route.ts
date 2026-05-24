import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteJoyItem, updateJoyItem } from "@/lib/list-of-joy";
import { PILLAR_KEYS } from "@/lib/curriculum";

const PILLAR_IDS = new Set([
  "love",
  "faith",
  "health",
  "family",
  "career",
  "community",
]);
const SUB_IDS = new Set<string>(PILLAR_KEYS);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;

  let body: { content?: unknown; pillar?: unknown; sub?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: { content?: string; pillar?: string | null; sub?: string | null } =
    {};
  if (typeof body.content === "string") {
    const c = body.content.trim().slice(0, 280);
    if (!c) {
      return NextResponse.json(
        { error: "Item can't be empty." },
        { status: 400 },
      );
    }
    patch.content = c;
  }
  if (body.pillar === null) patch.pillar = null;
  else if (typeof body.pillar === "string" && PILLAR_IDS.has(body.pillar))
    patch.pillar = body.pillar;
  if (body.sub === null) patch.sub = null;
  else if (typeof body.sub === "string" && SUB_IDS.has(body.sub))
    patch.sub = body.sub;

  try {
    const item = await updateJoyItem(user.id, id, patch);
    if (!item)
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[list-of-joy] update failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that change." },
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
    const ok = await deleteJoyItem(user.id, id);
    if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[list-of-joy] delete failed:", err);
    return NextResponse.json(
      { error: "We couldn't remove that." },
      { status: 500 },
    );
  }
}
