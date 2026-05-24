import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getChallengeStatus } from "@/lib/challenge";
import { BADGE_BY_ID, listEarned } from "@/lib/badges";
import { recentPulses } from "@/lib/joy-pulse";
import { loopCount } from "@/lib/itt-loops";

export const metadata: Metadata = {
  title: "Me",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = (await getCurrentUser())!;
  const [joyCountRows, forgivenessRows, challenge, badges, pulses, loops, assessRows] =
    await Promise.all([
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
      recentPulses(user.id, 7),
      loopCount(user.id),
      query<{ score: number; created_at: string | Date }>(
        `SELECT score, created_at FROM assessments
           WHERE user_id = $1 ORDER BY created_at DESC LIMIT 12`,
        [user.id],
      ),
    ]);

  const joyCount = Number(joyCountRows[0]?.c ?? 0);
  const forgivenessCount = Number(forgivenessRows[0]?.c ?? 0);
  const latestJq = assessRows[0]?.score ?? null;
  const baselineJq =
    assessRows.length > 0
      ? assessRows[assessRows.length - 1].score
      : null;
  const jqDelta =
    latestJq !== null && baselineJq !== null && assessRows.length > 1
      ? latestJq - baselineJq
      : null;
  const avgMood =
    pulses.length === 0
      ? null
      : Math.round(
          (pulses.reduce((s, p) => s + p.score, 0) / pulses.length) * 10,
        ) / 10;

  const heroStats: { label: string; value: string | number }[] = [
    { label: "List of Joy", value: joyCount },
    { label: "Days in", value: challenge.started_at ? challenge.current_day : 0 },
    {
      label: "Avg Pulse",
      value: avgMood !== null ? `${avgMood}/10` : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 pb-12 pt-6 sm:pt-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Me
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          The proof of the <em className="text-cyan-deep">journey</em>
        </h1>
      </header>

      {/* JQ hero — the headline number */}
      <section className="relative overflow-hidden rounded-3xl border border-navy/10 bg-gradient-to-br from-navy to-[#001f2a] p-6 text-white sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-cyan-deep/40 blur-2xl"
        />
        <p className="relative font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan/80">
          Joy Quotient
        </p>
        {latestJq === null ? (
          <div className="relative mt-3">
            <p className="font-serif text-[28px] font-medium">No baseline yet</p>
            <Link
              href="/assessment"
              className="mt-3 inline-block font-sans text-[13px] font-semibold text-cyan hover:underline"
            >
              Take your first JQ →
            </Link>
          </div>
        ) : (
          <div className="relative mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="font-serif text-[64px] font-medium leading-none tabular-nums">
                {latestJq}
                <span className="ml-2 font-sans text-[14px] font-light text-white/55">
                  / 100
                </span>
              </p>
              {jqDelta !== null && (
                <p
                  className={`mt-1 font-sans text-[12px] font-semibold ${
                    jqDelta > 0
                      ? "text-cyan"
                      : jqDelta < 0
                        ? "text-gold"
                        : "text-white/55"
                  }`}
                >
                  {jqDelta > 0 ? "▲" : jqDelta < 0 ? "▼" : "—"}{" "}
                  {Math.abs(jqDelta)} from baseline
                </p>
              )}
            </div>
            <Link
              href="/dashboard"
              className="font-sans text-[12px] font-semibold text-cyan hover:underline"
            >
              History →
            </Link>
          </div>
        )}
      </section>

      {/* Three hero stats */}
      <section className="grid grid-cols-3 gap-3">
        {heroStats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-navy/10 bg-white p-4 text-center"
          >
            <p className="font-serif text-[28px] font-medium tabular-nums text-navy">
              {s.value}
            </p>
            <p className="mt-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* Secondary counters — quieter */}
      <section className="grid grid-cols-3 gap-3 font-sans text-[12px] text-navy/55">
        <p>
          <span className="block font-serif text-[20px] font-medium text-navy">
            {loops}
          </span>
          ITT loops
        </p>
        <p>
          <span className="block font-serif text-[20px] font-medium text-navy">
            {forgivenessCount}
          </span>
          forgivenesses
        </p>
        <p>
          <span className="block font-serif text-[20px] font-medium text-navy">
            {badges.length}
          </span>
          badges
        </p>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-serif text-[20px] font-medium tracking-tight text-navy">
          Badges
        </h2>
        {badges.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-navy/15 bg-white p-6 text-center font-sans text-[13px] font-light text-navy/55">
            Take an action — your first will land here.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {badges.map((b) => {
              const def = BADGE_BY_ID.get(b.badge_id);
              if (!def) return null;
              return (
                <li
                  key={b.badge_id}
                  className="flex flex-col items-center rounded-2xl border border-gold/30 bg-[#FAF6EC] p-3 text-center"
                  title={def.description}
                >
                  <span aria-hidden className="text-[24px] leading-none text-gold">
                    {def.icon}
                  </span>
                  <p className="mt-1.5 font-serif text-[11px] leading-tight text-navy">
                    {def.title}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Show me my wins — primary lifeline link */}
      <Link
        href="/me/wins"
        className="group flex items-center justify-between gap-4 rounded-3xl border border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] to-white px-6 py-5 transition hover:border-[#C89A3F]/70"
      >
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6d00]">
            On a hard day
          </p>
          <p className="mt-1 font-serif text-[22px] font-medium text-navy">
            Show me my <em className="text-cyan-deep">wins</em>
          </p>
        </div>
        <span aria-hidden className="text-[28px] text-[#C89A3F] transition group-hover:translate-x-1">
          →
        </span>
      </Link>

      {/* Shortcuts — compact tile row */}
      <section className="grid gap-2 sm:grid-cols-2">
        {[
          { href: "/coach", label: "Your Coach", icon: "✦", accent: true },
          { href: "/courses", label: "Courses", icon: "▢" },
          { href: "/me/letters", label: "Letters", icon: "✉" },
          { href: "/me/my-joy", label: "My Joy Library", icon: "♥" },
          { href: "/curriculum/journal", label: "Journal", icon: "❋" },
          { href: "/curriculum/export", label: "Export", icon: "↓" },
          { href: "/account", label: "Settings", icon: "○" },
        ].map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
              s.accent
                ? "border-cyan-deep/30 bg-mist hover:border-cyan-deep/60"
                : "border-navy/12 bg-white hover:border-cyan-deep/30"
            }`}
          >
            <span
              aria-hidden
              className={`text-[18px] ${
                s.accent ? "text-cyan-deep" : "text-navy/45"
              }`}
            >
              {s.icon}
            </span>
            <span className="font-serif text-[15px] font-medium text-navy">
              {s.label}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
