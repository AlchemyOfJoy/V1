import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeStatus } from "@/lib/challenge";
import { WEEKS, PHASES } from "@/lib/challenge-days";
import StartChallengeButton from "./StartChallengeButton";

export const metadata: Metadata = {
  title: "Start the 90-Day Challenge",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The 90-Day Challenge walk-through.
 *
 * When the user taps "Start the AOJ 90-Day Challenge" from the
 * homescreen, they land here — not directly in the dashboard. This
 * page is an editorial briefing: what the Challenge IS, what the
 * twelve weeks contain, what to expect day-to-day, and the
 * commitment moment at the bottom.
 *
 * Tapping the final CTA flips the mode to 'challenge' (which stamps
 * challenge_started_at the first time) and routes to /dashboard
 * where Daily Session resolves Day 1.
 *
 * If the user is already in Challenge Mode they see a shorter "you're
 * already in the Challenge" surface with a continue button instead of
 * a commit button.
 */
export default async function ChallengeStartPage() {
  const user = (await getCurrentUser())!;
  const status = await getChallengeStatus(user.id);
  const alreadyIn =
    status.mode === "challenge" && status.current_day >= 1 && status.current_day <= 90;
  const graduated = status.mode === "challenge" && status.current_day > 90;

  if (alreadyIn) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-12 sm:pt-16">
        <Link
          href="/home"
          className="font-sans text-[12px] text-slate hover:text-cyan"
        >
          ← Home
        </Link>
        <header className="mt-8">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
            Already underway
          </p>
          <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[52px]">
            You&apos;re on <em className="text-cyan">Day {status.current_day}</em>.
          </h1>
          <p className="mt-3 font-serif text-[18px] italic leading-relaxed text-slate">
            The Challenge is patient. Pick up where you left off.
          </p>
        </header>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
          >
            Continue Day {status.current_day} →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-12 sm:pt-16">
      <Link
        href="/home"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← Home
      </Link>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <header className="mt-8">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          The AOJ 90-Day Challenge
        </p>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
          Ready to <em className="text-cyan">go deep</em>?
        </h1>
        <p className="mt-4 font-serif text-[20px] italic leading-relaxed text-slate">
          Brent&apos;s most structured program. Twelve weeks. Twenty to
          sixty minutes a day. By the end you&apos;re running a different
          system.
        </p>
      </header>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      {/* ─── WHAT IT IS ───────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          What it is
        </p>
        <p className="mt-4 font-serif text-[17px] leading-relaxed text-navy">
          Each day the app surfaces one focused piece of work — a
          reading, a Practice, a reflection. The daily rhythm (SubScript
          reads, Joy Pulse, ITT loop) runs alongside as your steady
          baseline. You can do more on any day. You can miss days
          without penalty. The work is patient.
        </p>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── THE TIMELINE ─────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          The timeline
        </p>
        <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-slate">
          Three months. Three movements. Twelve weekly themes.
        </p>

        <div className="mt-6 space-y-8">
          {PHASES.map((phase, phaseIdx) => {
            const phaseWeeks = WEEKS.filter((w) => {
              const dayStart = (w.week - 1) * 7 + 1;
              const dayEnd = w.week * 7;
              return (
                dayStart >= phase.range[0] && dayEnd <= phase.range[1] + 1
              );
            });
            return (
              <article key={phase.number}>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">
                  Month {phaseIdx + 1} · {phase.title}
                </p>
                <ol className="mt-3 divide-y divide-slate/15">
                  {phaseWeeks.map((w) => (
                    <li
                      key={w.week}
                      className="flex items-start gap-5 py-3"
                    >
                      <span
                        aria-hidden
                        className="font-serif text-[18px] italic leading-none text-gold"
                      >
                        {String(w.week).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-[17px] font-medium text-navy">
                          Week {w.week} · {w.title}
                        </p>
                        <p className="mt-0.5 font-sans text-[13px] font-light text-slate">
                          {w.action}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── WHAT TO EXPECT ───────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          What to expect, day to day
        </p>
        <ul className="mt-5 space-y-4 font-serif text-[16px] leading-relaxed text-navy">
          <li className="flex items-start gap-4">
            <span aria-hidden className="mt-1 text-gold">
              ✦
            </span>
            <div>
              <p className="font-medium">A clear daily anchor.</p>
              <p className="mt-0.5 font-sans text-[14px] font-light text-slate">
                Open the app — see one prescribed task. Begin it, finish
                it, close the app. Twenty to sixty minutes most days.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span aria-hidden className="mt-1 text-gold">
              ✦
            </span>
            <div>
              <p className="font-medium">Reflection days at week&apos;s end.</p>
              <p className="mt-0.5 font-sans text-[14px] font-light text-slate">
                Days 7, 14, 21, 28 (and on, every week) are lighter —
                re-read what you wrote, notice what shifted.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span aria-hidden className="mt-1 text-gold">
              ✦
            </span>
            <div>
              <p className="font-medium">JQ + Pillars re-measured monthly.</p>
              <p className="mt-0.5 font-sans text-[14px] font-light text-slate">
                On Day 28, 56, and 90 you&apos;ll re-take the JQ and
                re-score your Priority Pillars against your baseline.
                That&apos;s the data of who you&apos;re becoming.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span aria-hidden className="mt-1 text-gold">
              ✦
            </span>
            <div>
              <p className="font-medium">Miss a day? The work waits.</p>
              <p className="mt-0.5 font-sans text-[14px] font-light text-slate">
                No streaks to recover. No shame. The day number is days
                of work done, not days since starting. Day 90 lands when
                you complete Day 90&apos;s work, whenever that is.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span aria-hidden className="mt-1 text-gold">
              ✦
            </span>
            <div>
              <p className="font-medium">Day 90 is a ceremony.</p>
              <p className="mt-0.5 font-sans text-[14px] font-light text-slate">
                A final JQ. The Day 90 Report. The Alchemist meditation.
                Then a graduation into Practice Mode — the same daily
                rhythm, lifelong.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── THE COMMITMENT ──────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          The commitment
        </p>
        <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
          {graduated
            ? "Run the Challenge again?"
            : "Twelve weeks. New life."}
        </h2>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-slate">
          {graduated
            ? "You finished the arc. Starting fresh resets your Day 1 — your past work stays in My Alchemy."
            : "Doing this consistently for 90 days will change your life. Doing it inconsistently will still help. The work is patient. So am I."}
        </p>
        <p className="mt-3 font-sans text-[13px] text-slate">— BJF</p>

        <div className="mt-8">
          <StartChallengeButton restart={graduated} />
        </div>

        <Link
          href="/home"
          className="mt-4 block text-center font-sans text-[12px] text-slate hover:text-navy"
        >
          Give me a few more days
        </Link>
      </section>

      <p
        aria-hidden
        className="mt-12 text-center font-serif text-[24px] text-gold"
      >
        ✦
      </p>
    </main>
  );
}
