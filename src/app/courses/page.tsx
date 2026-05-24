import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listCourses } from "@/lib/courses";
import { listMyEnrollments } from "@/lib/enrollments";
import { formatPrice } from "@/lib/pricing";
import { Tridot } from "@/components/app/Wave";

export const metadata: Metadata = {
  title: "Courses",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoursesCatalogPage() {
  const user = (await getCurrentUser())!;
  const [courses, enrollments] = await Promise.all([
    listCourses(),
    listMyEnrollments(user.id),
  ]);
  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const enrolled = courses.filter((c) => enrolledIds.has(c.id));
  const available = courses.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 pb-12 pt-6 sm:pt-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Courses
        </p>
        <h1 className="mt-2 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          Brent&apos;s <em className="text-cyan-deep">deep dives</em>
        </h1>
        <p className="mt-3 font-sans text-[15px] font-light leading-relaxed text-navy/65">
          Structured learning around specific corners of the methodology.
          Standalone — and complementary to your Journey.
        </p>
      </header>

      {enrolled.length > 0 && (
        <section>
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
            In progress
          </h2>
          <ul className="mt-3 space-y-3">
            {enrolled.map((c) => (
              <CourseCard
                key={c.id}
                slug={c.slug}
                title={c.title}
                subtitle={c.subtitle}
                duration={c.estimated_duration_minutes}
                priceCents={c.price_cents}
                pricing={c.pricing_model}
              />
            ))}
          </ul>
        </section>
      )}

      {available.length > 0 && (
        <>
          {enrolled.length > 0 && <Tridot />}
          <section>
            <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
              Available to you
            </h2>
            <ul className="mt-3 space-y-3">
              {available.map((c) => (
                <CourseCard
                  key={c.id}
                  slug={c.slug}
                  title={c.title}
                  subtitle={c.subtitle}
                  duration={c.estimated_duration_minutes}
                  priceCents={c.price_cents}
                  pricing={c.pricing_model}
                />
              ))}
            </ul>
          </section>
        </>
      )}

      {courses.length === 0 && (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-12 text-center font-sans text-[14px] font-light text-navy/55">
          No courses are published yet.
        </p>
      )}

      <p className="text-center font-sans text-[12px] text-navy/45">
        ← <Link href="/library" className="hover:text-cyan-deep">Back to Library</Link>
      </p>
    </div>
  );
}

function CourseCard({
  slug,
  title,
  subtitle,
  duration,
  priceCents,
  pricing,
}: {
  slug: string;
  title: string;
  subtitle: string | null;
  duration: number | null;
  priceCents: number | null;
  pricing: string;
}) {
  return (
    <li>
      <Link
        href={`/courses/${slug}`}
        className="group flex items-start gap-4 rounded-3xl border border-navy/12 bg-white p-5 transition hover:border-cyan-deep/40"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-[22px] font-medium text-navy">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/65">
              {subtitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.16em] text-navy/45">
            {duration && <span>~{duration} min total</span>}
            {duration && <span>·</span>}
            <span>
              {pricing === "free" || pricing === "tier_included"
                ? "Included"
                : priceCents
                  ? formatPrice(priceCents)
                  : "Paid"}
            </span>
          </div>
        </div>
        <span aria-hidden className="self-center text-[20px] text-cyan-deep transition group-hover:translate-x-1">
          →
        </span>
      </Link>
    </li>
  );
}
