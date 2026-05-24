import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getChallengeStatus,
  listCheckins,
  weekForDay,
  WEEKS,
} from "@/lib/challenge";
import StartChallenge from "@/components/curriculum/challenge/StartChallenge";
import ChallengeCalendar from "@/components/curriculum/challenge/ChallengeCalendar";
import { btnPrimary } from "@/lib/ui";
import { getDayTask } from "@/lib/challenge-days";

export const metadata: Metadata = {
  title: "90-Day Challenge",
  robots: { index: false },
};

export default async function ChallengePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const status = await getChallengeStatus(user.id);
  const started = status.started_at !== null;

  if (!started) {
    return (
      <main className="px-6 py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-10">
          <header>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
              Practice · 90 Days
            </p>
            <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
              The 90-Day <em className="text-cyan-deep">Challenge</em>
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
              Thirteen weeks of small, daily inputs that compound into a
              different life. Begin when you&apos;re ready — there&apos;s no
              wrong day to start.
            </p>
          </header>

          <section className="space-y-4 rounded-3xl border border-navy/10 bg-mist p-6 sm:p-8">
            <h2 className="font-serif text-[22px] font-medium text-navy">
              What you&apos;ll do, every day
            </h2>
            <ul className="space-y-2 font-sans text-[15px] font-light leading-relaxed text-navy/75">
              <li>✦ Read your SubScript morning and evening.</li>
              <li>✦ Complete this week&apos;s one focus action.</li>
              <li>✦ Check in for sixty seconds — mood, what mattered.</li>
            </ul>
            <p className="font-sans text-[13px] font-light text-navy/55">
              Miss a day? Pick up where you left off. The day number tracks
              calendar days from your start — your check-ins fill in
              whenever you arrive.
            </p>
          </section>

          <section className="space-y-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              The arc
            </p>
            <ol className="grid gap-2 sm:grid-cols-2">
              {WEEKS.map((w) => (
                <li
                  key={w.week}
                  className="rounded-xl border border-navy/10 bg-white p-3"
                >
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-deep">
                    Week {w.week} · {w.title}
                  </p>
                  <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/70">
                    {w.focus}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <StartChallenge />
        </article>
      </main>
    );
  }

  const checkins = await listCheckins(user.id);
  const states: Record<
    number,
    { checked: boolean; amDone: boolean; pmDone: boolean }
  > = {};
  for (const c of checkins) {
    states[c.day_number] = {
      checked: true,
      amDone: c.subscript_morning_done,
      pmDone: c.subscript_evening_done,
    };
  }

  const week = weekForDay(status.current_day);
  const todayState = states[status.current_day];
  const completedToday =
    todayState?.checked && todayState.amDone && todayState.pmDone;

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-4xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Day {status.current_day} of 90 · Week {week.week} · {week.title}
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            Your <em className="text-cyan-deep">Challenge</em>
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
            {status.total_checkins} check-in
            {status.total_checkins === 1 ? "" : "s"} logged so far.
          </p>
        </header>

        {/* TODAY — the prescribed daily task */}
        {(() => {
          const task = getDayTask(status.current_day);
          if (!task) return null;
          return (
            <section
              className={`space-y-4 rounded-3xl border p-6 sm:p-8 ${
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
                Today · Day {status.current_day}
                {task.isMilestone ? " · milestone" : ""}
              </p>
              <h2 className="font-serif text-[26px] font-medium leading-tight text-navy sm:text-[30px]">
                {task.title}
              </h2>
              <p className="font-serif text-[17px] italic leading-relaxed text-navy/70">
                {task.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={task.primaryHref} className={btnPrimary}>
                  {task.primaryLabel} →
                </Link>
                <Link
                  href={`/curriculum/90-day-challenge/day/${status.current_day}`}
                  className="font-sans text-[13px] font-semibold text-navy/55 hover:text-cyan-deep"
                >
                  {completedToday ? "Review check-in" : "Mark complete →"}
                </Link>
              </div>
            </section>
          );
        })()}

        {/* This week's theme — secondary context */}
        <section className="rounded-2xl border border-navy/10 bg-white p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
              Week {week.week} of 13 · {week.title}
            </p>
            <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-navy/45">
              The theme
            </span>
          </div>
          <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-navy/75">
            {week.focus}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Your 90 days
          </h2>
          <ChallengeCalendar
            currentDay={status.current_day}
            states={states}
          />
          <div className="flex flex-wrap gap-4 font-sans text-[11px] text-navy/55">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-cyan-deep" /> Both
              SubScript reads done
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-cyan-deep/45" /> One read
              done
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-mist" /> Logged
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border-2 border-cyan-deep bg-white" />{" "}
              Today
            </span>
          </div>
        </section>

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum"
            className="font-sans text-[13px] text-navy/55 transition-colors hover:text-cyan-deep"
          >
            ← Back to curriculum
          </Link>
        </footer>
      </article>
    </main>
  );
}
