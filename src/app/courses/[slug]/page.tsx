import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourseWithCurriculum,
  lessonSequence,
  totalLessons,
} from "@/lib/courses";
import {
  completionPercentage,
  getEnrollment,
  listProgress,
} from "@/lib/enrollments";
import { formatPrice } from "@/lib/pricing";
import { Tridot } from "@/components/app/Wave";
import EnrollButton from "@/components/courses/EnrollButton";

export const metadata: Metadata = {
  title: "Course",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = (await getCurrentUser())!;
  const course = await getCourseWithCurriculum(slug);
  if (!course || course.status !== "published") notFound();

  const enrollment = await getEnrollment(user.id, course.id);
  const total = totalLessons(course);
  const pct = enrollment
    ? await completionPercentage(enrollment.id, total)
    : 0;
  const progress = enrollment ? await listProgress(enrollment.id) : [];
  const completedSet = new Set(
    progress.filter((p) => p.completed_at !== null).map((p) => p.lesson_id),
  );
  const sequence = lessonSequence(course);
  const nextLessonId =
    enrollment && sequence.find((id) => !completedSet.has(id));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 pb-12 pt-6 sm:pt-10">
      <Link
        href="/courses"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Courses
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          {course.course_type === "certification" ? "Certification" : "Deep dive"}
          {course.estimated_duration_minutes
            ? ` · ~${course.estimated_duration_minutes} min total`
            : ""}
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="mt-3 font-serif text-[18px] italic leading-relaxed text-navy/65">
            {course.subtitle}
          </p>
        )}
      </header>

      {course.description && (
        <section className="font-serif text-[16px] leading-[1.85] text-navy/85 whitespace-pre-wrap">
          {course.description}
        </section>
      )}

      {/* Enroll / continue CTA */}
      {enrollment ? (
        <section className="rounded-3xl border border-cyan-deep/30 bg-mist p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
              {pct === 100 ? "Complete" : "In progress"}
            </p>
            <p className="font-serif text-[22px] font-medium tabular-nums text-navy">
              {pct}%
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full bg-cyan-deep transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {nextLessonId && (
            <Link
              href={`/courses/${course.slug}/lesson/${nextLessonId}`}
              className="mt-4 inline-block rounded-full bg-cyan-deep px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
            >
              Continue →
            </Link>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-navy/12 bg-white p-5">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            {course.pricing_model === "free" ||
            course.pricing_model === "tier_included"
              ? "Included with your membership"
              : course.price_cents
                ? formatPrice(course.price_cents)
                : "Paid course"}
          </p>
          <EnrollButton
            slug={course.slug}
            disabled={
              course.pricing_model === "paid_one_time" ||
              course.pricing_model === "paid_subscription"
            }
          />
          {(course.pricing_model === "paid_one_time" ||
            course.pricing_model === "paid_subscription") && (
            <p className="mt-2 font-sans text-[11px] italic text-navy/45">
              Paid checkout wires in once Stripe Connect is approved.
            </p>
          )}
        </section>
      )}

      <Tridot />

      {/* Curriculum */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          What&apos;s inside
        </h2>
        <ol className="mt-4 space-y-4">
          {course.modules.map((m, mi) => (
            <li key={m.id} className="rounded-2xl border border-navy/10 bg-white p-5">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                Module {mi + 1}
              </p>
              <h3 className="mt-1 font-serif text-[19px] font-medium text-navy">
                {m.title}
              </h3>
              {m.lessons.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {m.lessons.map((l, li) => {
                    const done = completedSet.has(l.id);
                    const inner = (
                      <>
                        <span
                          aria-hidden
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                            done
                              ? "bg-cyan-deep text-white"
                              : "border border-navy/20 bg-white text-transparent"
                          }`}
                        >
                          {done ? "✓" : "·"}
                        </span>
                        <span className="flex-1 font-serif text-[15px] text-navy">
                          {mi + 1}.{li + 1} {l.title}
                        </span>
                        {l.estimated_duration_minutes && (
                          <span className="font-sans text-[11px] text-navy/45">
                            {l.estimated_duration_minutes}m
                          </span>
                        )}
                      </>
                    );
                    return (
                      <li key={l.id}>
                        {enrollment ? (
                          <Link
                            href={`/courses/${course.slug}/lesson/${l.id}`}
                            className="flex items-center gap-3 rounded-lg py-1.5 transition hover:text-cyan-deep"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 py-1.5">
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
