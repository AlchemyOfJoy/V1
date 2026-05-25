import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getChallengeStatus } from "@/lib/challenge";
import { listEarned } from "@/lib/badges";
import { recentPulses } from "@/lib/joy-pulse";

export const metadata: Metadata = {
  title: "My Alchemy",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * MY ALCHEMY — the user's personal record (Master Prompt §16).
 *
 * Editorial trophy room. Pure white canvas, large numerals, slate-rule
 * dividers, sharp corners. The Proof / The Documents / The Memories /
 * The Future — four sections, ample whitespace, no shadows.
 */
export default async function MyAlchemyPage() {
  const user = (await getCurrentUser())!;

  const [
    joyCountRows,
    forgivenessCountRows,
    challenge,
    badges,
    pulses,
    assessRows,
    resetCountRows,
    lettersRows,
  ] = await Promise.all([
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
      [user.id],
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM forgiveness_subjects
         WHERE user_id = $1 AND completed_at IS NOT NULL`,
      [user.id],
    ),
    getChallengeStatus(user.id),
    listEarned(user.id),
    recentPulses(user.id, 30),
    query<{ score: number; created_at: string | Date }>(
      `SELECT score, created_at FROM assessments
         WHERE user_id = $1 ORDER BY created_at ASC`,
      [user.id],
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM joy_pulse WHERE user_id = $1`,
      [user.id],
    ),
    query<{
      arrived: string;
      pending: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE sent_at IS NOT NULL)::text AS arrived,
         COUNT(*) FILTER (WHERE sent_at IS NULL)::text AS pending
       FROM letters_to_self WHERE user_id = $1`,
      [user.id],
    ),
  ]);

  const firstName = user.name?.split(" ")[0] ?? user.email.split("@")[0];
  const joyCount = Number(joyCountRows[0]?.c ?? 0);
  const forgivenessCount = Number(forgivenessCountRows[0]?.c ?? 0);
  const resetCount = Number(resetCountRows[0]?.c ?? 0);
  const daysIn = challenge.started_at ? challenge.current_day : 0;
  const baselineJq = assessRows[0]?.score ?? null;
  const latestJq =
    assessRows.length > 0 ? assessRows[assessRows.length - 1].score : null;
  const lettersPending = Number(lettersRows[0]?.pending ?? 0);
  const daysUntil90 =
    challenge.current_day > 0 && challenge.current_day <= 90
      ? Math.max(0, 90 - challenge.current_day + 1)
      : 0;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pt-14">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
        Your Personal Record
      </p>
      <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
        Your <em className="text-cyan">Alchemy</em>.
      </h1>
      <p className="mt-3 font-sans text-[16px] font-light text-slate">
        {firstName} · {daysIn > 0 ? `Day ${daysIn}` : "Day 1 begins"}
      </p>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      {/* ─── THE PROOF ──────────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          The Proof
        </p>
        <ul className="mt-5 space-y-3 font-serif text-[20px] leading-relaxed text-navy">
          <li>
            You&apos;ve shown up{" "}
            <span className="font-medium tabular-nums text-cyan">{daysIn}</span>{" "}
            times.
          </li>
          <li>
            You&apos;ve added{" "}
            <span className="font-medium tabular-nums text-cyan">
              {joyCount}
            </span>{" "}
            things to your Joy.
          </li>
          <li>
            You&apos;ve forgiven{" "}
            <span className="font-medium tabular-nums text-cyan">
              {forgivenessCount}
            </span>{" "}
            {forgivenessCount === 1 ? "person" : "people"}.
          </li>
          <li>
            You&apos;ve logged{" "}
            <span className="font-medium tabular-nums text-cyan">
              {pulses.length}
            </span>{" "}
            Joy Pulses in the last 30 days.
          </li>
          {baselineJq !== null && latestJq !== null && assessRows.length > 1 && (
            <li>
              Your JQ went from{" "}
              <span className="font-medium tabular-nums text-slate">
                {baselineJq}
              </span>{" "}
              to{" "}
              <span className="font-medium tabular-nums text-cyan">
                {latestJq}
              </span>
              .
            </li>
          )}
        </ul>
        <Link
          href="/me/wins"
          className="mt-6 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan hover:text-navy"
        >
          → See everything
        </Link>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── THE DOCUMENTS ──────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          The Documents
        </p>
        <ul className="mt-5 divide-y divide-slate/15">
          {[
            {
              glyph: "✦",
              label: "My Core Narrative",
              action: "Edit",
              href: "/curriculum/module/02-joyful-operating-system/core-narrative",
            },
            {
              glyph: "⚱",
              label: "My Self Eulogy",
              action: "Read",
              href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
            },
            {
              glyph: "✦",
              label: `My List of Joy (${joyCount})`,
              action: "Browse",
              href: "/me/my-joy",
            },
            {
              glyph: "01",
              label: "My Priority Pillars",
              action: "Score",
              href: "/curriculum/module/02-joyful-operating-system/priority-pillars",
            },
            {
              glyph: "▶",
              label: "My SubScript",
              action: "Read",
              href: "/curriculum/module/02-joyful-operating-system/subscript",
            },
            {
              glyph: "✦",
              label: "My Forgiveness Vault",
              action: "Enter",
              href: "/curriculum/module/03-forgiveness",
            },
          ].map((doc) => (
            <li key={doc.label}>
              <Link
                href={doc.href}
                className="flex items-center gap-5 py-4 transition-colors duration-150 hover:text-cyan"
              >
                <span
                  aria-hidden
                  className="w-6 font-serif text-[18px] text-slate group-hover:text-cyan"
                >
                  {doc.glyph}
                </span>
                <span className="flex-1 font-serif text-[18px] text-navy">
                  {doc.label}
                </span>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">
                  {doc.action}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── THE MEMORIES (badges as Memory Stones stand-in) ── */}
      {badges.length > 0 && (
        <>
          <section>
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
              The Memories
            </p>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {badges.slice(0, 12).map((b) => (
                <div
                  key={b.badge_id}
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center border border-slate/20 bg-white p-3 text-center"
                >
                  <span aria-hidden className="text-[22px] text-gold">
                    ✦
                  </span>
                  <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-slate">
                    {new Date(b.earned_at as unknown as string).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <div aria-hidden className="my-10 h-px w-full bg-slate/15" />
        </>
      )}

      {/* ─── THE FUTURE ─────────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          The Future
        </p>
        <ul className="mt-5 space-y-3 font-serif text-[18px] leading-relaxed text-navy">
          <li>
            <Link
              href="/me/letters"
              className="flex items-center gap-3 hover:text-cyan"
            >
              <span aria-hidden className="text-slate">
                ✉
              </span>
              <span>
                Letters from past you
                {lettersPending > 0 && (
                  <span className="font-sans text-[13px] text-slate">
                    {" "}
                    ({lettersPending} pending)
                  </span>
                )}
              </span>
            </Link>
          </li>
          <li className="flex items-center gap-3">
            <span aria-hidden className="text-slate">
              ◯
            </span>
            <span>
              {daysIn > 0
                ? `Currently on Day ${daysIn} of Challenge`
                : "Day 1 begins tomorrow"}
            </span>
          </li>
          {daysUntil90 > 0 && (
            <li className="flex items-center gap-3">
              <span aria-hidden className="text-gold">
                ✦
              </span>
              <span>
                Day 90 in{" "}
                <span className="font-medium tabular-nums">{daysUntil90}</span>{" "}
                {daysUntil90 === 1 ? "day" : "days"}
              </span>
            </li>
          )}
        </ul>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── SETTINGS (the only secondary nav per UI/UX §0) ── */}
      <nav aria-label="Settings">
        <ul className="grid grid-cols-2 gap-y-3 font-sans text-[13px] text-slate sm:grid-cols-3">
          <li>
            <Link href="/me/notifications" className="hover:text-cyan">
              Notifications →
            </Link>
          </li>
          <li>
            <Link href="/account" className="hover:text-cyan">
              Settings →
            </Link>
          </li>
        </ul>
        <p aria-hidden className="mt-10 text-center text-[20px] text-gold">
          ✦
        </p>
        <p className="mt-2 text-center font-sans text-[11px] uppercase tracking-[0.26em] text-slate/55">
          Return to yourself.
        </p>
      </nav>

      <p className="sr-only">{resetCount} Reset Breaths logged in your time.</p>
    </main>
  );
}
