import Link from "next/link";
import { btnPrimary } from "@/lib/ui";
import { WEEKS } from "@/lib/challenge";
import { getDayTask } from "@/lib/challenge-days";

/**
 * "Day N of 90" hero card on Home — the primary "what to do today"
 * surface. Has two states:
 *
 *   Active (today not yet logged) → big CTA, today's task description
 *   Complete (today logged)        → confirmation + tomorrow preview
 *
 * Milestone days (1, 30, 60, 90) get gold treatment in both states.
 */
export default function TodayCard({
  currentDay,
  totalCheckins,
  todayLogged,
}: {
  currentDay: number;
  totalCheckins: number;
  todayLogged: boolean;
}) {
  const task = getDayTask(currentDay);
  if (!task) return null;
  const week = WEEKS.find((w) => w.week === task.weekNumber);
  const tomorrowTask = currentDay < 90 ? getDayTask(currentDay + 1) : null;
  const tomorrowIsMilestone = tomorrowTask?.isMilestone === true;
  const remainingPossible = Math.max(0, 90 - currentDay + 1);

  // DONE STATE — today is logged
  if (todayLogged) {
    return (
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${
          task.isMilestone
            ? "border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] via-white to-[#FAF6EC]"
            : "border-cyan-deep/25 bg-gradient-to-br from-mist via-white to-mist"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan-deep/15 blur-2xl"
        />
        <div className="relative">
          <p
            className={`font-sans text-[10px] font-semibold uppercase tracking-[0.24em] ${
              task.isMilestone ? "text-[#8a6d00]" : "text-cyan-deep"
            }`}
          >
            ✓ Day {currentDay} done
          </p>
          <h2 className="mt-2 font-serif text-[24px] font-medium leading-tight text-navy sm:text-[26px]">
            {task.isMilestone ? "Milestone earned." : "That's today's work."}
          </h2>
          <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-navy/65">
            {totalCheckins} of 90 logged so far.
            {currentDay < 90
              ? " See you tomorrow."
              : " The arc is complete."}
          </p>

          {tomorrowTask && (
            <div className="mt-5 rounded-2xl border border-navy/10 bg-white p-4">
              <p
                className={`font-sans text-[10px] font-semibold uppercase tracking-[0.22em] ${
                  tomorrowIsMilestone ? "text-[#8a6d00]" : "text-navy/55"
                }`}
              >
                Tomorrow · Day {currentDay + 1}
                {tomorrowIsMilestone ? " · milestone" : ""}
              </p>
              <p className="mt-1 font-serif text-[17px] font-medium text-navy">
                {tomorrowTask.title}
              </p>
              <p className="mt-1 font-sans text-[12px] font-light text-navy/55">
                ~{tomorrowTask.estimatedMin} min
              </p>
            </div>
          )}

          {/* Optional bonus actions when today is done */}
          <div className="mt-5 flex flex-wrap gap-2 font-sans text-[12px] text-navy/55">
            <Link
              href="/me/wins"
              className="rounded-full border border-navy/15 bg-white px-3 py-1.5 font-semibold transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              See your wins →
            </Link>
            <Link
              href="/curriculum/90-day-challenge"
              className="rounded-full border border-navy/15 bg-white px-3 py-1.5 font-semibold transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              All 90 days →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ACTIVE STATE — today not yet logged
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${
        task.isMilestone
          ? "border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] via-white to-[#FAF6EC]"
          : "border-cyan-deep/25 bg-gradient-to-br from-white via-mist/60 to-mist"
      }`}
    >
      {task.isMilestone && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#C89A3F]/15 blur-2xl"
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`font-sans text-[10px] font-semibold uppercase tracking-[0.24em] ${
              task.isMilestone ? "text-[#8a6d00]" : "text-cyan-deep"
            }`}
          >
            Day {currentDay} of 90
            {week ? ` · ${week.title}` : ""}
            {task.isMilestone ? " · milestone" : ""}
          </p>
          <h2 className="mt-2 font-serif text-[24px] font-medium leading-tight text-navy sm:text-[28px]">
            {task.title}
          </h2>
          <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-navy/70">
            {task.description}
          </p>
        </div>
        {task.isMilestone && (
          <span
            aria-hidden
            className="shrink-0 text-[28px] leading-none text-[#C89A3F]"
          >
            ✦
          </span>
        )}
      </div>
      <div className="relative mt-5 flex flex-wrap items-center gap-3">
        <Link href={task.primaryHref} className={btnPrimary}>
          {task.primaryLabel} →
        </Link>
        <Link
          href={`/curriculum/90-day-challenge/day/${currentDay}`}
          className="font-sans text-[12px] font-semibold text-navy/55 hover:text-cyan-deep"
        >
          Mark complete →
        </Link>
        <span className="ml-auto font-sans text-[11px] text-navy/45">
          {totalCheckins} of 90 logged · {remainingPossible} days ahead
        </span>
      </div>
    </section>
  );
}
