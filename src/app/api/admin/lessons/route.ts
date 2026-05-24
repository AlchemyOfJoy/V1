import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createLesson, type LessonType } from "@/lib/courses";

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

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  let body: {
    module_id?: unknown;
    title?: unknown;
    lesson_type?: unknown;
    sort_order?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.module_id !== "string")
    return NextResponse.json({ error: "module_id required." }, { status: 400 });
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  if (!title)
    return NextResponse.json({ error: "Title required." }, { status: 400 });
  const lessonType =
    typeof body.lesson_type === "string" && VALID.includes(body.lesson_type as LessonType)
      ? (body.lesson_type as LessonType)
      : "text";
  const sortOrder =
    typeof body.sort_order === "number" ? body.sort_order : 100;
  try {
    const lesson = await createLesson({
      module_id: body.module_id,
      title,
      lesson_type: lessonType,
      sort_order: sortOrder,
    });
    return NextResponse.json({ lesson });
  } catch (err) {
    console.error("[admin/lessons] create failed:", err);
    return NextResponse.json(
      { error: "Couldn't create lesson." },
      { status: 500 },
    );
  }
}
