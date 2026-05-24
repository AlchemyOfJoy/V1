import type { Metadata } from "next";
import Link from "next/link";
import { listCourses } from "@/lib/courses";
import CourseListAdmin from "@/components/admin/CourseListAdmin";

export const metadata: Metadata = {
  title: "Courses · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoursesAdminPage() {
  const courses = await listCourses({ includeDrafts: true });
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Admin · Courses
          </p>
          <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy">
            Course Platform
          </h1>
          <p className="mt-2 font-sans text-[14px] font-light text-navy/65">
            Build structured learning. Each course is modules and lessons —
            text, video embed, audio, exercises, Coach Cards, cross-links.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-full bg-cyan-deep px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
        >
          + New course
        </Link>
      </header>
      <div className="mt-8">
        <CourseListAdmin
          initial={courses.map((c) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            status: c.status,
            course_type: c.course_type,
            pricing_model: c.pricing_model,
          }))}
        />
      </div>
    </main>
  );
}
