import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getChallengeStatus } from "@/lib/challenge";
import { getJosState } from "@/lib/jos";

export const metadata: Metadata = {
  title: "Today",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The Home choice landing — three paths, one resource link.
 *
 *   1. Start AOJ 90-Day Challenge   (primary)
 *   2. Go to Joyful Operating System (primary)
 *   3. Jump Back In                  (smaller, returns to dashboard)
 *   4. Alchemy Tools                 (link, all resources)
 *
 * The Daily Session card arc moved to /dashboard. This screen lets the
 * user steer their session intent before being dropped into the flow.
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

  const [nameRow, challenge, jos] = await Promise.all([
    query<{ name: string | null }>(
      `SELECT name FROM users WHERE id = $1`,
      [user.id],
    ),
    getChallengeStatus(user.id),
    getJosState(user.id),
  ]);
  const firstName =
    nameRow[0]?.name?.split(" ")[0] ?? user.email.split("@")[0];

  const inChallenge =
    challenge.mode === "challenge" &&
    challenge.current_day > 0 &&
    challenge.current_day <= 90;
  const challengeLabel = inChallenge
    ? `Continue · Day ${challenge.current_day} of 90`
    : challenge.mode === "challenge" && challenge.current_day > 90
      ? "The 90 days are run · review"
      : "Start the 90-Day Challenge";
  const challengeSub = inChallenge
    ? "Pick up where you left off."
    : challenge.mode === "challenge"
      ? "You finished the arc. Re-read what shifted."
      : "Twelve weeks. Brent's structured program.";

  const josComplete = jos.install_completed_at !== null;
  const josSub = josComplete
    ? `All six components installed. Revisit, edit, deepen.`
    : `${jos.components_completed.length} of 6 components installed.`;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-12 sm:pt-16">
      <header>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Today
        </p>
        <h1 className="mt-4 font-serif text-[40px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[52px]">
          Where to, <em className="text-cyan">{firstName}</em>?
        </h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-slate">
          Pick a path. The work meets you wherever you start.
        </p>
      </header>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      {/* PRIMARY CHOICE A · 90-Day Challenge */}
      <Link
        href="/challenge/start"
        className="group block border-t border-slate/25 py-7 transition hover:border-cyan"
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Path A · Structured
        </p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-navy sm:text-[32px]">
          {inChallenge
            ? "Continue the 90-Day Challenge"
            : "Start the AOJ 90-Day Challenge"}
        </h2>
        <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-slate">
          {challengeSub}
        </p>
        <span
          aria-hidden
          className="mt-4 inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-cyan transition group-hover:gap-3"
        >
          {challengeLabel} →
        </span>
      </Link>

      {/* PRIMARY CHOICE B · JOS */}
      <Link
        href="/jos"
        className="group block border-t border-slate/25 py-7 transition hover:border-cyan"
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Path B · The foundation
        </p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-navy sm:text-[32px]">
          Go to your Joyful Operating System
        </h2>
        <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-slate">
          Core Narrative · Self-Eulogy · List of Joy · Priority Pillars
          · SubScript.
        </p>
        <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.22em] text-slate/70">
          {josSub}
        </p>
      </Link>

      <div aria-hidden className="my-8 h-px w-full bg-slate/15" />

      {/* SMALLER CHOICE · Jump back in */}
      <Link
        href="/dashboard"
        className="group block py-4 transition hover:text-cyan"
      >
        <p className="font-serif text-[20px] font-medium text-navy group-hover:text-cyan">
          Jump back in →
        </p>
        <p className="mt-1 font-sans text-[13px] font-light text-slate">
          Your daily session — Joy Drop, Pulse, today&apos;s anchor.
        </p>
      </Link>

      <div aria-hidden className="my-8 h-px w-full bg-slate/15" />

      {/* RESOURCES LINK · Alchemy Tools */}
      <Link
        href="/tools"
        className="group inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan hover:text-navy"
      >
        ✦ Alchemy Tools — all resources →
      </Link>

      <p
        aria-hidden
        className="mt-12 text-center font-sans text-[11px] uppercase tracking-[0.26em] text-slate/55"
      >
        Return to yourself.
      </p>
    </main>
  );
}
