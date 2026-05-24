import type { Metadata } from "next";
import Link from "next/link";
import { JOURNEY, type IttPillar } from "@/lib/itt";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import IttDiagram from "@/components/app/IttDiagram";
import { getChallengeStatus, WEEKS } from "@/lib/challenge";
import { getDayTask } from "@/lib/challenge-days";

export const metadata: Metadata = { title: "Journey", robots: { index: false } };
export const dynamic = "force-dynamic";

const PILLAR_NUMBER: Record<IttPillar, string> = {
  foundations: "00",
  invest: "01",
  train: "02",
  action: "03",
  integration: "04",
};

export default async function JourneyPage() {
  const user = (await getCurrentUser())!;
  const completed = await query<{ worksheet_id: string }>(
    `SELECT worksheet_id FROM worksheet_responses
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [user.id],
  );
  const challenge = await getChallengeStatus(user.id);
  const currentDay = challenge.started_at ? challenge.current_day : 1;
  const currentWeek = WEEKS.find(
    (w) => w.week === Math.ceil(currentDay / 7),
  );
  const todayTask = getDayTask(currentDay);

  const doneIds = new Set(completed.map((r) => r.worksheet_id));
  const sectionDone: Record<string, boolean> = {
    "core-narrative": doneIds.has("02_core_narrative"),
    "self-eulogy": doneIds.has("02_self_eulogy"),
    "list-of-joy": doneIds.has("02_list_of_joy"),
    "priority-pillars": doneIds.has("02_priority_pillars"),
    "subscript": doneIds.has("02_subscript"),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 pb-12 pt-6 sm:pt-10">
      {/* The 90-Day arc — front and center, the spine of how the app is used */}
      <header className="space-y-5">
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Your 90-Day arc
          </p>
          <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
            Day <em className="text-cyan-deep">{currentDay}</em>
            <span className="font-sans text-[18px] font-light text-navy/45">
              {" "}
              of 90
            </span>
          </h1>
          {currentWeek && (
            <p className="mt-2 font-serif text-[16px] italic text-navy/65">
              Week {currentWeek.week} · {currentWeek.title} —{" "}
              {currentWeek.focus.toLowerCase()}
            </p>
          )}
        </div>
        {todayTask && (
          <Link
            href={`/curriculum/90-day-challenge/day/${currentDay}`}
            className={`group block rounded-3xl border p-5 transition ${
              todayTask.isMilestone
                ? "border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] to-white hover:border-[#C89A3F]/70"
                : "border-cyan-deep/30 bg-gradient-to-br from-mist to-white hover:border-cyan-deep/60"
            }`}
          >
            <p
              className={`font-sans text-[10px] font-semibold uppercase tracking-[0.22em] ${
                todayTask.isMilestone ? "text-[#8a6d00]" : "text-cyan-deep"
              }`}
            >
              Today
              {todayTask.isMilestone ? " · milestone" : ""}
            </p>
            <p className="mt-1 font-serif text-[20px] font-medium text-navy">
              {todayTask.title}
            </p>
            <p className="mt-1 font-sans text-[12px] font-light text-navy/55">
              ~{todayTask.estimatedMin} min · tap to open the day
            </p>
          </Link>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full bg-cyan-deep transition-all"
              style={{ width: `${(currentDay / 90) * 100}%` }}
            />
          </div>
          <Link
            href="/curriculum/90-day-challenge"
            className="font-sans text-[12px] font-semibold text-cyan-deep hover:underline whitespace-nowrap"
          >
            See all 90 →
          </Link>
        </div>
      </header>

      {/* The 13-week arc summary — what's coming */}
      <section>
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
          The 13-week arc
        </h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {WEEKS.map((w) => {
            const status =
              currentWeek && w.week < currentWeek.week
                ? "past"
                : currentWeek && w.week === currentWeek.week
                  ? "current"
                  : "ahead";
            return (
              <li
                key={w.week}
                className={`rounded-xl border p-3 ${
                  status === "current"
                    ? "border-cyan-deep/40 bg-mist"
                    : status === "past"
                      ? "border-cyan-deep/20 bg-white"
                      : "border-navy/10 bg-white"
                }`}
              >
                <p
                  className={`font-sans text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    status === "current"
                      ? "text-cyan-deep"
                      : status === "past"
                        ? "text-navy/45"
                        : "text-navy/35"
                  }`}
                >
                  Week {w.week}
                  {status === "past" ? " · done" : status === "current" ? " · now" : ""}
                </p>
                <p className="mt-0.5 font-serif text-[14px] font-medium text-navy">
                  {w.title}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Deeper reference — the ITT framework + curriculum modules */}
      <section className="space-y-4">
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
          The methodology beneath the arc
        </h2>
        <div className="rounded-3xl border border-navy/10 bg-gradient-to-br from-mist/60 to-white p-4 sm:p-6">
          <IttDiagram className="mx-auto max-w-md" />
        </div>
      </section>

      {/* Pillars */}
      <ol className="space-y-4">
        {JOURNEY.map((pillar) => {
          const completeCount = pillar.sections.filter(
            (s) => sectionDone[s.id] === true,
          ).length;
          const totalCount = pillar.sections.length;
          const pct =
            totalCount === 0 ? 0 : Math.round((completeCount / totalCount) * 100);

          const isHero =
            pillar.id === "invest" ||
            pillar.id === "train" ||
            pillar.id === "action";

          return (
            <li key={pillar.id}>
              <details
                className="group overflow-hidden rounded-3xl border border-navy/10 bg-white open:border-cyan-deep/30 open:shadow-[0_2px_12px_rgba(0,23,31,0.06)]"
                open={pct > 0 && pct < 100}
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-semibold ${
                      pct === 100
                        ? "bg-cyan-deep text-white"
                        : pct > 0
                          ? "bg-cyan-deep/15 text-cyan-deep"
                          : "bg-mist text-navy/50"
                    }`}
                    aria-hidden
                  >
                    {PILLAR_NUMBER[pillar.id]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2
                      className={`font-serif font-medium tracking-tight text-navy ${
                        isHero ? "text-[22px]" : "text-[18px]"
                      }`}
                    >
                      {pillar.title.split(pillar.italicWord)[0]}
                      <em className="text-cyan-deep">{pillar.italicWord}</em>
                      {pillar.title.split(pillar.italicWord)[1] ?? ""}
                    </h2>
                    <p className="mt-0.5 font-sans text-[12px] font-light text-navy/55">
                      {pillar.tagline}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-serif text-[15px] font-medium tabular-nums text-navy">
                      {pct}%
                    </span>
                    <span className="ml-2 text-navy/40 transition group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>

                {/* Progress strip */}
                <div className="mx-5 h-[3px] overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full bg-cyan-deep transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Sections list — no description prose, just title + minutes */}
                <ul className="mt-2 divide-y divide-navy/8">
                  {pillar.sections.map((s) => {
                    const done = sectionDone[s.id] === true;
                    return (
                      <li key={s.id}>
                        <Link
                          href={s.href}
                          className="flex items-center gap-3 px-5 py-3 transition hover:bg-mist/40"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              done
                                ? "bg-cyan-deep text-white"
                                : "border border-navy/20 bg-white text-transparent"
                            }`}
                            aria-hidden
                          >
                            {done ? "✓" : "·"}
                          </span>
                          <span className="flex-1 truncate font-serif text-[15px] text-navy">
                            {s.title}
                          </span>
                          <span className="font-sans text-[11px] tabular-nums text-navy/45">
                            {s.estimatedMin}m
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
