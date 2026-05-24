import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getLesson } from "@/lib/courses";
import LessonEditor from "@/components/admin/LessonEditor";

export const metadata: Metadata = {
  title: "Edit lesson · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const [course, lesson] = await Promise.all([
    getCourseById(id),
    getLesson(lessonId),
  ]);
  if (!course || !lesson) notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/admin/courses/${id}`}
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← {course.title}
      </Link>
      <header className="mt-3">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Lesson · {lesson.lesson_type}
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-tight tracking-tight text-navy">
          {lesson.title}
        </h1>
      </header>
      <div className="mt-8">
        <LessonEditor
          courseId={id}
          initial={{
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            lesson_type: lesson.lesson_type,
            sort_order: lesson.sort_order,
            body: lesson.body,
            video_embed_url: lesson.video_embed_url,
            audio_embed_url: lesson.audio_embed_url,
            transcript: lesson.transcript,
            coach_card_mode: lesson.coach_card_mode,
            cross_link_href: lesson.cross_link_href,
            reflection_prompts: lesson.reflection_prompts,
            estimated_duration_minutes: lesson.estimated_duration_minutes,
          }}
        />
      </div>
    </main>
  );
}
