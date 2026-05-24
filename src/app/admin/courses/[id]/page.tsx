import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseWithCurriculum } from "@/lib/courses";
import CourseBuilder from "@/components/admin/CourseBuilder";

export const metadata: Metadata = {
  title: "Edit course · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseWithCurriculum(id);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/admin/courses"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← All courses
      </Link>
      <header className="mt-3">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          {course.course_type === "certification" ? "Certification" : "Course"} ·{" "}
          {course.status}
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy">
          {course.title}
        </h1>
        <p className="mt-1 font-sans text-[13px] text-navy/55">/{course.slug}</p>
      </header>
      <div className="mt-8">
        <CourseBuilder
          course={{
            id: course.id,
            slug: course.slug,
            title: course.title,
            subtitle: course.subtitle,
            description: course.description,
            cover_image_url: course.cover_image_url,
            course_type: course.course_type,
            pricing_model: course.pricing_model,
            price_cents: course.price_cents,
            drip_mode: course.drip_mode,
            estimated_duration_minutes: course.estimated_duration_minutes,
            tags: course.tags,
            status: course.status,
          }}
          modules={course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            sort_order: m.sort_order,
            lessons: m.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              lesson_type: l.lesson_type,
              sort_order: l.sort_order,
              estimated_duration_minutes: l.estimated_duration_minutes,
            })),
          }))}
        />
      </div>
    </main>
  );
}
