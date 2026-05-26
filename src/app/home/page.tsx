import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getChallengeStatus } from "@/lib/challenge";
import { getDayTask } from "@/lib/challenge-days";
import {
  getTodaysIntention,
  getYesterdaysIntention,
  promptForToday,
} from "@/lib/intentions";
import IntentionForm from "@/components/home/IntentionForm";

export const metadata: Metadata = {
  title: "Today",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Home — the daily entry per Synthesis Spec §2.
 *
 * Three states, decided server-side from time-of-day + intention state:
 *
 *   1. MORNING + no intention yet → IntentionForm
 *      "What will you create today?" — the locked entry ritual.
 *
 *   2. INTENTION SET (any time before evening) → two equal-weight CTAs
 *      CONTINUE DAY N (filled cyan) · BROWSE (outline cyan)
 *      Plus the persistent BrentBot pill below.
 *
 *   3. EVENING (after 5pm) → reflection prompt
 *      Same as state 2 if no reflection saved; routes to /home/reflect
 *      from the "How did it go?" link.
 *
 * No tab bar. No floating ⚡. The BrentBot pill is the only support
 * surface besides the 💬 in the header.
 */
export default async function HomePage() {
  const user = (await getCurrentUser())!;

  // Onboarding gate
  const onboardCheck = await query<{
    curriculum_started_at: string | Date | null;
  }>(`SELECT curriculum_started_at FROM users WHERE id = $1`, [user.id]);
  if (!onboardCheck[0]?.curriculum_started_at) {
    redirect("/curriculum/onboarding");
  }

  const [nameRow, today, yesterday, challenge] = await Promise.all([
    query<{ name: string | null }>(
      `SELECT name FROM users WHERE id = $1`,
      [user.id],
    ),
    getTodaysIntention(user.id),
    getYesterdaysIntention(user.id),
    getChallengeStatus(user.id),
  ]);

  const firstName =
    nameRow[0]?.name?.split(" ")[0] ?? user.email.split("@")[0];
  const hour = new Date().getHours();
  const isEvening = hour >= 17;
  const greeting =
    hour < 5
      ? "Late night"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Hello"
          : "Good evening";
  const weekday = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const todayLabel = isEvening
    ? `${weekday} evening`
    : hour < 12
      ? `${weekday} morning`
      : `${weekday} afternoon`;

  const dayN =
    challenge.mode === "challenge" &&
    challenge.current_day >= 1 &&
    challenge.current_day <= 90
      ? challenge.current_day
      : null;
  const task = dayN !== null ? getDayTask(dayN) : null;

  const prompt = today?.prompt ?? promptForToday(user.id);
  const hasIntention = !!today?.intention;
  const hasReflection = !!today?.evening_reflection || !!today?.evening_pulse;
  const yesterdayNeedsReflection =
    !!yesterday?.intention &&
    !yesterday.evening_reflection &&
    !yesterday.evening_pulse;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
      {/* ─── HEADER ───────────────────────────────────────── */}
      <header>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          {dayN ? `Day ${dayN} · ${todayLabel}` : todayLabel}
        </p>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
          {greeting}, <em className="text-cyan">{firstName}</em>.
        </h1>
        <div aria-hidden className="mt-6 h-px w-20 bg-slate/30" />
      </header>

      {/* ─── STATE 1 · NO INTENTION YET ──────────────────── */}
      {!hasIntention && (
        <section className="mt-10">
          <h2 className="font-serif text-[32px] font-medium leading-tight text-navy sm:text-[36px]">
            {prompt}
          </h2>
          <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate">
            Set your intention. One sentence.
          </p>
          <IntentionForm prompt={prompt} />
        </section>
      )}

      {/* ─── STATE 2 · INTENTION SET, TWO EQUAL CTAs ─────── */}
      {hasIntention && (
        <>
          <section className="mt-10">
            <p className="font-serif text-[15px] italic text-slate">
              Today you&apos;ll create:
            </p>
            <p className="mt-2 font-serif text-[22px] italic leading-relaxed text-navy">
              {today!.intention}
            </p>
            <p
              aria-hidden
              className="mt-4 text-[20px] text-gold"
            >
              ✦
            </p>
          </section>

          <div
            aria-hidden
            className="my-10 h-px w-full bg-slate/15"
          />

          {/* TWO EQUAL-WEIGHT CARDS — Lock 3 */}
          <section className="grid gap-5 sm:grid-cols-2">
            {/* CARD 1 · The Challenge */}
            <article className="flex flex-col border-t border-slate/25 pt-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan">
                {dayN
                  ? `Day ${dayN} · the Challenge`
                  : challenge.mode === "challenge" && challenge.current_day > 90
                    ? "The Challenge · complete"
                    : "Start the Challenge"}
              </p>
              <h3 className="mt-3 font-serif text-[24px] font-medium leading-tight text-navy">
                {task?.title ??
                  (challenge.mode === "challenge"
                    ? "You finished the arc."
                    : "Begin the 90-Day Challenge.")}
              </h3>
              {task?.description && (
                <p className="mt-2 font-serif text-[15px] italic leading-relaxed text-slate line-clamp-3">
                  {task.description}
                </p>
              )}
              <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.22em] text-slate/70">
                {task
                  ? `~${task.estimatedMin} min`
                  : challenge.mode === "challenge"
                    ? "Maintenance mode"
                    : "Twelve weeks"}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  href={
                    dayN && task
                      ? task.primaryHref
                      : challenge.mode === "challenge"
                        ? "/my-work"
                        : "/challenge/start"
                  }
                  className="inline-flex items-center justify-center rounded-full bg-cyan px-7 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-navy"
                >
                  {dayN
                    ? `Continue Day ${dayN} →`
                    : challenge.mode === "challenge"
                      ? "Open your wins →"
                      : "Start the 90-Day Challenge →"}
                </Link>
              </div>
            </article>

            {/* CARD 2 · Browse / your own way */}
            <article className="flex flex-col border-t border-slate/25 pt-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan">
                Or · go your own way
              </p>
              <h3 className="mt-3 font-serif text-[24px] font-medium leading-tight text-navy">
                Explore the book
              </h3>
              <p className="mt-2 font-serif text-[15px] italic leading-relaxed text-slate">
                Pick any exercise, chapter, or meditation you want today.
              </p>
              <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.22em] text-slate/70">
                20 chapters · 15 exercises · 11 meditations
              </p>
              <div className="mt-auto pt-6">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center rounded-full border border-cyan px-7 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-cyan transition hover:bg-cyan hover:text-white"
                >
                  Browse →
                </Link>
              </div>
            </article>
          </section>

          {/* ─── BRENTBOT PERSISTENT PILL — Lock 2 ─────────── */}
          <Link
            href="/coach"
            className="group mt-10 flex items-center gap-4 rounded-full border-[1.5px] border-cyan bg-white px-6 py-4 transition hover:bg-cyan hover:text-white"
          >
            <span
              aria-hidden
              className="text-[20px] text-gold transition group-hover:text-white"
            >
              ✦
            </span>
            <div className="flex-1">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-navy group-hover:text-white">
                Talk to BrentBot
              </p>
              <p className="mt-0.5 font-serif text-[14px] italic text-slate group-hover:text-white/85">
                Stuck, confused, or just need a coach?
              </p>
            </div>
            <span
              aria-hidden
              className="font-sans text-[14px] text-slate group-hover:text-white"
            >
              →
            </span>
          </Link>

          {/* ─── EVENING REFLECTION INVITE ─────────────────── */}
          {isEvening && !hasReflection && (
            <div className="mt-10 border-t border-slate/15 pt-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">
                Evening reflection
              </p>
              <p className="mt-3 font-serif text-[18px] italic leading-relaxed text-navy">
                How did today go? Did you create what you set out to?
              </p>
              <Link
                href="/home/reflect"
                className="mt-4 inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan hover:text-navy"
              >
                Reflect on today →
              </Link>
            </div>
          )}

          {/* ─── YESTERDAY'S RECAP (if reflection still owed) ── */}
          {yesterdayNeedsReflection && !isEvening && (
            <div className="mt-10 border-t border-slate/15 pt-6">
              <p className="font-serif text-[14px] italic leading-relaxed text-slate">
                Yesterday you set out to:
              </p>
              <p className="mt-1 font-serif text-[16px] italic text-navy">
                {yesterday!.intention}
              </p>
              <Link
                href="/home/reflect?for=yesterday"
                className="mt-3 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan hover:text-navy"
              >
                How did it go? →
              </Link>
            </div>
          )}
        </>
      )}

      {/* ─── FOOTER LINKS ─────────────────────────────────── */}
      <footer className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate/15 pt-6 font-sans text-[12px] text-slate">
        <Link href="/my-work" className="hover:text-cyan">
          My Work →
        </Link>
        <Link href="/book" className="hover:text-cyan">
          The Book →
        </Link>
        <Link href="/account" className="hover:text-cyan">
          Settings →
        </Link>
      </footer>
    </main>
  );
}
