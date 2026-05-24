import Link from "next/link";
import { btnPrimary } from "@/lib/ui";
import { WEEKS } from "@/lib/challenge";
import { getDayTask } from "@/lib/challenge-days";

/**
 * "Day N of 90" hero card on Home — the primary "what to do today"
 * surface. Replaces the old "What's next" pill with something much
 * more anchoring: this is the structured arc you're walking through.
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
        {todayLogged ? (
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
            ✓ logged today
          </p>
        ) : (
          <Link
            href={`/curriculum/90-day-challenge/day/${currentDay}`}
            className="font-sans text-[12px] font-semibold text-navy/55 hover:text-cyan-deep"
          >
            Mark complete →
          </Link>
        )}
        <span className="ml-auto font-sans text-[11px] text-navy/45">
          {totalCheckins} of 90 logged
        </span>
      </div>
    </section>
  );
}
