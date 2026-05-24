import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getChallengeStatus,
  getCheckin,
  TOTAL_DAYS,
  weekForDay,
} from "@/lib/challenge";
import { getDayTask } from "@/lib/challenge-days";
import { btnPrimary } from "@/lib/ui";
import DayCheckin from "@/components/curriculum/challenge/DayCheckin";

export const metadata: Metadata = {
  title: "Daily Check-In",
  robots: { index: false },
};

export default async function DayPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { n } = await params;
  const dayNum = Number.parseInt(n, 10);
  if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > TOTAL_DAYS) notFound();

  const status = await getChallengeStatus(user.id);
  if (!status.started_at) redirect("/curriculum/90-day-challenge");

  const checkin = await getCheckin(user.id, dayNum);
  const week = weekForDay(dayNum);
  const isToday = dayNum === status.current_day;
  const isFuture = dayNum > status.current_day;

  const initial = checkin
    ? {
        day_number: checkin.day_number,
        subscript_morning_done: checkin.subscript_morning_done,
        subscript_evening_done: checkin.subscript_evening_done,
        weekly_focus_action: checkin.weekly_focus_action,
        reflection: checkin.reflection,
        mood_rating: checkin.mood_rating,
      }
    : null;

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Week {week.week} · {week.title}
            {isToday ? " · Today" : isFuture ? " · Upcoming" : " · Past"}
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            Day <em className="text-cyan-deep">{dayNum}</em>
            <span className="font-sans text-[20px] font-light text-navy/50">
              {" "}
              / 90
            </span>
          </h1>
        </header>

        {/* Today's specific task (the new day-by-day spine) */}
        {(() => {
          const task = getDayTask(dayNum);
          if (!task) return null;
          return (
            <section
              className={`space-y-4 rounded-3xl border p-6 sm:p-7 ${
                task.isMilestone
                  ? "border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] via-white to-[#FAF6EC]"
                  : "border-cyan-deep/30 bg-gradient-to-br from-mist to-white"
              }`}
            >
              <p
                className={`font-sans text-[10px] font-semibold uppercase tracking-[0.24em] ${
                  task.isMilestone ? "text-[#8a6d00]" : "text-cyan-deep"
                }`}
              >
                Today&apos;s task{task.isMilestone ? " · milestone" : ""}
              </p>
              <h2 className="font-serif text-[26px] font-medium leading-tight text-navy">
                {task.title}
              </h2>
              <p className="font-serif text-[17px] italic leading-relaxed text-navy/70">
                {task.description}
              </p>
              {!isFuture && (
                <Link href={task.primaryHref} className={btnPrimary}>
                  {task.primaryLabel} →
                </Link>
              )}
            </section>
          );
        })()}

        {/* This week's theme — secondary */}
        <section className="space-y-3 rounded-3xl border border-navy/10 bg-mist p-6">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            This week — {week.title}
          </p>
          <p className="font-serif text-[18px] italic text-navy/75">
            {week.focus}
          </p>
          <p className="font-sans text-[13px] font-light leading-relaxed text-navy/65">
            {week.action}
          </p>
          {week.link && (
            <Link
              href={week.link}
              className="inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
            >
              Open the work →
            </Link>
          )}
        </section>

        {isFuture ? (
          <section className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center">
            <p className="font-sans text-[15px] font-light text-navy/60">
              This day is up ahead. Come back when you arrive — your
              check-in opens then.
            </p>
            <Link
              href="/curriculum/90-day-challenge"
              className="mt-4 inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
            >
              ← Back to overview
            </Link>
          </section>
        ) : (
          <DayCheckin day={dayNum} initial={initial} />
        )}

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum/90-day-challenge"
            className="font-sans text-[13px] text-navy/55 transition-colors hover:text-cyan-deep"
          >
            ← All 90 days
          </Link>
        </footer>
      </article>
    </main>
  );
}
