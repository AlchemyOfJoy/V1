import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createModule, deleteModule, updateModule } from "@/lib/courses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  let body: { title?: unknown; sort_order?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  if (!title)
    return NextResponse.json({ error: "Title required." }, { status: 400 });
  const sortOrder =
    typeof body.sort_order === "number" ? body.sort_order : 100;
  try {
    const m = await createModule({
      course_id: id,
      title,
      sort_order: sortOrder,
    });
    return NextResponse.json({ module: m });
  } catch (err) {
    console.error("[admin/modules] create failed:", err);
    return NextResponse.json(
      { error: "Couldn't create module." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  let body: {
    module_id?: unknown;
    title?: unknown;
    description?: unknown;
    sort_order?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.module_id !== "string")
    return NextResponse.json({ error: "Missing module_id." }, { status: 400 });
  const patch: Parameters<typeof updateModule>[1] = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (body.description !== undefined)
    patch.description = body.description as string | null;
  if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;
  const updated = await updateModule(body.module_id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ module: updated });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  let body: { module_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.module_id !== "string")
    return NextResponse.json({ error: "Missing module_id." }, { status: 400 });
  const ok = await deleteModule(body.module_id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
