import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import {
  deleteContent,
  getContent,
  updateContent,
} from "@/lib/coach/content";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  const item = await getContent(id);
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: Parameters<typeof updateContent>[1] = {};
  if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 200);
  if (typeof body.body === "string") {
    const text = body.body.trim();
    if (text.length > 250_000) {
      return NextResponse.json(
        { error: "Body too long — split it." },
        { status: 400 },
      );
    }
    patch.body = text;
  }
  if (body.source === null) patch.source = null;
  else if (typeof body.source === "string")
    patch.source = body.source.trim().slice(0, 200) || null;
  if (Array.isArray(body.tags)) {
    patch.tags = (body.tags as unknown[])
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
  if (typeof body.sort_order === "number")
    patch.sort_order = Math.round(body.sort_order);

  try {
    const item = await updateContent(id, patch);
    if (!item)
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[admin/coach-content] update failed:", err);
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
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  try {
    const ok = await deleteContent(id);
    if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/coach-content] delete failed:", err);
    return NextResponse.json(
      { error: "We couldn't remove that." },
      { status: 500 },
    );
  }
}
