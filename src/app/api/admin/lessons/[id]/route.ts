import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { deleteLesson, getLesson, updateLesson, type LessonType } from "@/lib/courses";

const VALID: LessonType[] = [
  "text",
  "video",
  "audio",
  "exercise",
  "reflection",
  "workshop",
  "coach_card",
  "cross_link",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  const lesson = await getLesson(id);
  if (!lesson)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ lesson });
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
  const patch: Parameters<typeof updateLesson>[1] = {};
  if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 200);
  if (body.description !== undefined)
    patch.description = body.description as string | null;
  if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;
  if (typeof body.lesson_type === "string" && VALID.includes(body.lesson_type as LessonType))
    patch.lesson_type = body.lesson_type as LessonType;
  if (body.body !== undefined) patch.body = body.body as string | null;
  if (body.video_embed_url !== undefined)
    patch.video_embed_url = body.video_embed_url as string | null;
  if (body.audio_embed_url !== undefined)
    patch.audio_embed_url = body.audio_embed_url as string | null;
  if (body.transcript !== undefined)
    patch.transcript = body.transcript as string | null;
  if (body.coach_card_mode !== undefined)
    patch.coach_card_mode = body.coach_card_mode as string | null;
  if (body.cross_link_href !== undefined)
    patch.cross_link_href = body.cross_link_href as string | null;
  if (Array.isArray(body.reflection_prompts))
    patch.reflection_prompts = (body.reflection_prompts as unknown[])
      .filter((p): p is string => typeof p === "string")
      .slice(0, 12);
  if (
    body.exercise_config !== undefined &&
    typeof body.exercise_config === "object" &&
    body.exercise_config !== null
  )
    patch.exercise_config = body.exercise_config as Record<string, unknown>;
  if (typeof body.estimated_duration_minutes === "number")
    patch.estimated_duration_minutes = body.estimated_duration_minutes;
  const updated = await updateLesson(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ lesson: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await params;
  const ok = await deleteLesson(id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
