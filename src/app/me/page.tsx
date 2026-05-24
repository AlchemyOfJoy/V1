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

interface CountRow {
  c: string;
}

interface CompletedSection {
  worksheet_id: string;
}

export default async function MePage() {
  const user = (await getCurrentUser())!;

  const [
    joyCountRows,
    completedRows,
    forgivenessRows,
    challenge,
    badges,
    pulses,
    loops,
    assessmentsRows,
  ] = await Promise.all([
    query<CountRow>(
      `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
      [user.id],
    ),
    query<CompletedSection>(
      `SELECT worksheet_id FROM worksheet_responses
         WHERE user_id = $1 AND completed_at IS NOT NULL`,
      [user.id],
    ),
    query<CountRow>(
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
         WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [user.id],
    ),
  ]);

  const joyCount = Number(joyCountRows[0]?.c ?? 0);
  const completedCount = completedRows.length;
  const forgivenessCount = Number(forgivenessRows[0]?.c ?? 0);
  const latestJq = assessmentsRows[0]?.score ?? null;
  const baselineJq = assessmentsRows[assessmentsRows.length - 1]?.score ?? null;
  const jqDelta =
    latestJq !== null && baselineJq !== null && assessmentsRows.length > 1
      ? latestJq - baselineJq
      : null;

  const recentMood =
    pulses.length === 0
      ? null
      : Math.round(
          (pulses.reduce((sum, p) => sum + p.score, 0) / pulses.length) * 10,
        ) / 10;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-8 sm:py-12">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Me
        </p>
        <h1 className="mt-3 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          The proof of the <em className="text-cyan-deep">journey</em>
        </h1>
      </header>

      {/* My progress (cumulative counters) */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Counter label="List of Joy" value={joyCount} />
        <Counter label="JOS® sections complete" value={completedCount} />
        <Counter label="Forgivenesses released" value={forgivenessCount} />
        <Counter
          label="Challenge day"
          value={challenge.started_at ? challenge.current_day : 0}
        />
        <Counter label="ITT loops closed" value={loops} />
        <Counter
          label="Avg Joy Pulse (7-day)"
          value={recentMood ?? 0}
          suffix={recentMood !== null ? " / 10" : ""}
        />
      </section>

      {/* JQ trajectory */}
      <section className="rounded-3xl border border-navy/10 bg-white p-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
          Joy Quotient
        </p>
        {latestJq === null ? (
          <>
            <p className="mt-2 font-serif text-[20px] font-medium text-navy">
              No baseline yet
            </p>
            <Link
              href="/assessment"
              className="mt-2 inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
            >
              Take your first JQ →
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 font-serif text-[32px] font-medium text-navy">
              {latestJq}
              <span className="ml-1 font-sans text-[14px] font-light text-navy/55">
                / 100
              </span>
              {jqDelta !== null && (
                <span
                  className={`ml-3 font-sans text-[14px] font-semibold ${
                    jqDelta > 0
                      ? "text-cyan-deep"
                      : jqDelta < 0
                        ? "text-[#8a6d00]"
                        : "text-navy/55"
                  }`}
                >
                  {jqDelta > 0 ? "▲" : jqDelta < 0 ? "▼" : "—"}{" "}
                  {Math.abs(jqDelta)} from baseline
                </span>
              )}
            </p>
            <Link
              href="/dashboard"
              className="mt-2 inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
            >
              See full history →
            </Link>
          </>
        )}
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Badges
          <span className="ml-2 font-sans text-[13px] font-light text-navy/45">
            {badges.length}
          </span>
        </h2>
        {badges.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-navy/15 bg-white p-6 font-sans text-[14px] font-light text-navy/55">
            Nothing earned yet. Badges are private — for you, not the
            world. Take an action and the first one will land here.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b) => {
              const def = BADGE_BY_ID.get(b.badge_id);
              if (!def) return null;
              return (
                <li
                  key={b.badge_id}
                  className="rounded-2xl border border-navy/10 bg-white p-4 text-center"
                >
                  <p
                    aria-hidden
                    className="text-[28px] leading-none text-gold"
                  >
                    {def.icon}
                  </p>
                  <p className="mt-2 font-serif text-[14px] font-medium text-navy">
                    {def.title}
                  </p>
                  <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.14em] text-navy/45">
                    {new Date(b.earned_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Account + data shortcuts */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/account"
          className="rounded-2xl border border-navy/12 bg-white p-4 transition hover:border-cyan-deep/40"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
            Settings
          </p>
          <p className="mt-1 font-serif text-[16px] font-medium text-navy">
            Profile · password · delete
          </p>
        </Link>
        <Link
          href="/curriculum/export"
          className="rounded-2xl border border-navy/12 bg-white p-4 transition hover:border-cyan-deep/40"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
            Your workbook
          </p>
          <p className="mt-1 font-serif text-[16px] font-medium text-navy">
            Export · print · download JSON
          </p>
        </Link>
        <Link
          href="/curriculum/journal"
          className="rounded-2xl border border-navy/12 bg-white p-4 transition hover:border-cyan-deep/40"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
            Journal
          </p>
          <p className="mt-1 font-serif text-[16px] font-medium text-navy">
            Every reflection in one place
          </p>
        </Link>
        <Link
          href="/coach"
          className="rounded-2xl border border-cyan-deep/30 bg-mist p-4 transition hover:border-cyan-deep/60"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
            ✦ Companion
          </p>
          <p className="mt-1 font-serif text-[16px] font-medium text-navy">
            Talk to Brent — anytime
          </p>
        </Link>
      </section>
    </div>
  );
}

function Counter({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
        {label}
      </p>
      <p className="mt-1 font-serif text-[28px] font-medium tabular-nums text-navy">
        {value}
        {suffix && (
          <span className="ml-1 font-sans text-[12px] font-light text-navy/55">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
