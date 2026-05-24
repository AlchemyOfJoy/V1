import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourseWithCurriculum,
  lessonSequence,
} from "@/lib/courses";
import {
  getEnrollment,
  getLessonProgress,
} from "@/lib/enrollments";
import LessonPlayer from "@/components/courses/LessonPlayer";

export const metadata: Metadata = {
  title: "Lesson",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const user = (await getCurrentUser())!;
  const course = await getCourseWithCurriculum(slug);
  if (!course) notFound();

  // Locate the lesson + flatten the sequence so we know prev/next
  const all = course.modules.flatMap((m, mi) =>
    m.lessons.map((l, li) => ({ ...l, moduleIndex: mi, lessonIndex: li, moduleTitle: m.title })),
  );
  const seq = lessonSequence(course);
  const idx = seq.indexOf(lessonId);
  const lesson = all.find((l) => l.id === lessonId);
  if (!lesson || idx === -1) notFound();

  const enrollment = await getEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/courses/${course.slug}`);

  const progress = await getLessonProgress(enrollment.id, lesson.id);
  const moduleNumber = lesson.moduleIndex + 1;
  const lessonNumber = lesson.lessonIndex + 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 pb-16 pt-6 sm:pt-10">
      <Link
        href={`/courses/${course.slug}`}
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← {course.title} · Module {moduleNumber} / {course.modules.length}
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Lesson {moduleNumber}.{lessonNumber}
          {lesson.estimated_duration_minutes
            ? ` · ${lesson.estimated_duration_minutes} min`
            : ""}
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy sm:text-[36px]">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-navy/65">
            {lesson.description}
          </p>
        )}
      </header>

      <LessonPlayer
        courseSlug={course.slug}
        lesson={lesson}
        progress={{
          completed_at: progress?.completed_at ?? null,
          notes: progress?.notes ?? "",
          reflection_responses: progress?.reflection_responses ?? {},
        }}
        nextLessonId={idx < seq.length - 1 ? seq[idx + 1] : null}
      />
    </div>
  );
}
