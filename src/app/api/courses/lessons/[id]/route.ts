import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  getCourseWithCurriculum,
  getLesson,
  totalLessons,
} from "@/lib/courses";
import {
  getEnrollment,
  markLessonComplete,
  maybeIssueCertificate,
  saveLessonNotes,
  saveLessonReflections,
  startLesson,
} from "@/lib/enrollments";

async function resolveContext(userId: string, lessonId: string) {
  const lesson = await getLesson(lessonId);
  if (!lesson) return null;
  const courseRow = await query<{ id: string }>(
    `SELECT c.id FROM courses c
       JOIN course_modules m ON m.course_id = c.id
       WHERE m.id = $1`,
    [lesson.module_id],
  );
  const courseId = courseRow[0]?.id;
  if (!courseId) return null;
  const enrollment = await getEnrollment(userId, courseId);
  if (!enrollment) return null;
  return { lesson, courseId, enrollment };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: {
    action?: unknown;
    notes?: unknown;
    reflection_responses?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id } = await params;
  const ctx = await resolveContext(user.id, id);
  if (!ctx)
    return NextResponse.json(
      { error: "Not enrolled or lesson not found." },
      { status: 404 },
    );

  try {
    if (body.action === "start") {
      await startLesson(ctx.enrollment.id, id);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "notes" && typeof body.notes === "string") {
      await saveLessonNotes(
        ctx.enrollment.id,
        id,
        body.notes.slice(0, 20000),
      );
      return NextResponse.json({ ok: true });
    }
    if (
      body.action === "reflect" &&
      body.reflection_responses &&
      typeof body.reflection_responses === "object"
    ) {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(
        body.reflection_responses as Record<string, unknown>,
      )) {
        if (typeof v === "string") clean[k] = v.slice(0, 8000);
      }
      await saveLessonReflections(ctx.enrollment.id, id, clean);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "complete") {
      await markLessonComplete(ctx.enrollment.id, id);
      const course = await getCourseWithCurriculum(ctx.courseId);
      if (course) {
        const cert = await maybeIssueCertificate(
          ctx.enrollment.id,
          totalLessons(course),
        );
        return NextResponse.json({ ok: true, completed_course: cert });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[courses/lesson] failed:", err);
    return NextResponse.json(
      { error: "Couldn't save that." },
      { status: 500 },
    );
  }
}
