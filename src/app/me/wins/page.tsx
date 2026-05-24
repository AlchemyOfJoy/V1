import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { recentPulses } from "@/lib/joy-pulse";
import { listEarned, BADGE_BY_ID } from "@/lib/badges";
import { Tridot } from "@/components/app/Wave";

export const metadata: Metadata = {
  title: "Show me my wins",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ShowMyWinsPage() {
  const user = (await getCurrentUser())!;

  const [joyFirst, joyCountRows, forgivenessRows, scriptRows, narrativeRows, pillarSnapRows, latestSub, badges, pulses] =
    await Promise.all([
      query<{ content: string; created_at: string | Date }>(
        `SELECT content, created_at FROM list_of_joy_items
           WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
        [user.id],
      ),
      query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
        [user.id],
      ),
      query<{ subject_name: string; completed_at: string | Date | null }>(
        `SELECT subject_name, completed_at FROM forgiveness_subjects
           WHERE user_id = $1 AND completed_at IS NOT NULL
           ORDER BY completed_at ASC`,
        [user.id],
      ),
      query<{ data: unknown; updated_at: string | Date }>(
        `SELECT data, updated_at FROM worksheet_responses
           WHERE user_id = $1 AND worksheet_id = '02_self_eulogy'
           ORDER BY updated_at DESC LIMIT 1`,
        [user.id],
      ),
      query<{ data: unknown }>(
        `SELECT data FROM worksheet_responses
           WHERE user_id = $1 AND worksheet_id = '02_core_narrative'
           ORDER BY updated_at DESC LIMIT 1`,
        [user.id],
      ),
      query<{
        taken_at: string | Date;
        love_self: number | null;
        love_romantic: number | null;
        faith_self: number | null;
        faith_universe: number | null;
        health_mind: number | null;
        health_body: number | null;
        family_blood: number | null;
        family_chosen: number | null;
        career_money: number | null;
        career_giving_back: number | null;
        community_personal: number | null;
        community_professional: number | null;
      }>(
        `SELECT * FROM priority_pillar_snapshots
           WHERE user_id = $1 ORDER BY taken_at ASC`,
        [user.id],
      ),
      query<{ created_at: string | Date }>(
        `SELECT created_at FROM subscripts
           WHERE user_id = $1 ORDER BY version ASC LIMIT 1`,
        [user.id],
      ),
      listEarned(user.id),
      recentPulses(user.id, 30),
    ]);

  const joyCount = Number(joyCountRows[0]?.c ?? 0);
  const firstJoy = joyFirst[0];
  const eulogy = scriptRows[0];
  const eulogyText = ((eulogy?.data as { eulogy?: string } | undefined)?.eulogy ?? "").trim();
  const coreNarrative = narrativeRows[0]?.data as
    | { old_narratives?: (string | undefined)[]; new_narratives?: (string | undefined)[] }
    | undefined;
  const oldStory = coreNarrative?.old_narratives?.find((s) => s && s.trim());
  const newStory = coreNarrative?.new_narratives?.find((s) => s && s.trim());

  const firstPillar = pillarSnapRows[0];
  const latestPillar = pillarSnapRows[pillarSnapRows.length - 1];

  function avgPillar(
    row: typeof pillarSnapRows[number] | undefined,
  ): number | null {
    if (!row) return null;
    const vals = [
      row.love_self,
      row.love_romantic,
      row.faith_self,
      row.faith_universe,
      row.health_mind,
      row.health_body,
      row.family_blood,
      row.family_chosen,
      row.career_money,
      row.career_giving_back,
      row.community_personal,
      row.community_professional,
    ].filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }

  const firstAvg = avgPillar(firstPillar);
  const latestAvg = avgPillar(latestPillar);

  const subStart = latestSub[0]?.created_at;

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-5 pb-16 pt-8 sm:pt-12">
      <Link
        href="/me"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Me
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          On a hard day
        </p>
        <h1 className="mt-2 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
          Show me my <em className="text-cyan-deep">wins</em>
        </h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-navy/65">
          Every piece of proof you are not where you were.
        </p>
      </header>

      <Tridot />

      {/* First List of Joy → now */}
      {firstJoy && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Your List of Joy
          </p>
          <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-navy/75">
            Started{" "}
            {new Date(firstJoy.created_at).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            with:
          </p>
          <p className="mt-2 font-serif text-[20px] leading-relaxed text-navy">
            <span className="text-gold">✦</span> {firstJoy.content}
          </p>
          <p className="mt-4 font-serif text-[36px] font-medium tabular-nums text-navy">
            {joyCount}{" "}
            <span className="font-sans text-[14px] font-light text-navy/55">
              joys today
            </span>
          </p>
        </section>
      )}

      {/* Pillars then → now */}
      {firstAvg !== null && latestAvg !== null && firstPillar !== latestPillar && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Priority Pillars · then & now
          </p>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-navy/45">
                Day 1
              </p>
              <p className="mt-1 font-serif text-[40px] font-medium tabular-nums text-navy/60">
                {firstAvg}
              </p>
            </div>
            <div className="text-center">
              <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-cyan-deep">
                Today
              </p>
              <p className="mt-1 font-serif text-[40px] font-medium tabular-nums text-navy">
                {latestAvg}
              </p>
            </div>
          </div>
          <p className="mt-4 text-center font-serif text-[16px] italic text-navy/65">
            {latestAvg > firstAvg
              ? `Up ${(latestAvg - firstAvg).toFixed(1)} from baseline.`
              : latestAvg < firstAvg
                ? "The data is honest. Some days are seasons."
                : "Holding steady."}
          </p>
        </section>
      )}

      {/* Core Narrative rewrite */}
      {oldStory && newStory && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Story rewritten
          </p>
          <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.16em] text-navy/45">
            Old
          </p>
          <p className="mt-1 font-serif text-[17px] italic text-navy/65 line-through decoration-navy/30">
            {oldStory}
          </p>
          <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.16em] text-cyan-deep">
            New
          </p>
          <p className="mt-1 font-serif text-[19px] leading-relaxed text-navy">
            {newStory}
          </p>
        </section>
      )}

      {/* Forgiveness archive */}
      {forgivenessRows.length > 0 && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Weights set down
          </p>
          <p className="mt-2 font-serif text-[32px] font-medium tabular-nums text-navy">
            {forgivenessRows.length}
          </p>
          <ul className="mt-3 space-y-1 font-serif text-[16px] italic text-navy/75">
            {forgivenessRows.map((f, i) => (
              <li key={i}>✦ {f.subject_name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Self-Eulogy excerpt */}
      {eulogyText && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Your Self-Eulogy
          </p>
          <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-navy/85">
            {eulogyText.length > 320 ? `${eulogyText.slice(0, 320)}…` : eulogyText}
          </p>
        </section>
      )}

      {/* SubScript anniversary */}
      {subStart && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Your SubScript
          </p>
          <p className="mt-2 font-serif text-[20px] font-medium text-navy">
            Built{" "}
            {new Date(subStart).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="mt-1 font-serif text-[16px] italic text-navy/65">
            And you&apos;ve been reading it ever since.
          </p>
        </section>
      )}

      {/* Joy Pulse line */}
      {pulses.length >= 3 && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Mood, last 30 days
          </p>
          <PulseLine
            pulses={pulses.slice().reverse().map((p) => p.score)}
          />
        </section>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <section className="rounded-3xl border border-navy/10 bg-white p-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Earned
          </p>
          <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {badges.slice(0, 18).map((b) => {
              const def = BADGE_BY_ID.get(b.badge_id);
              if (!def) return null;
              return (
                <li
                  key={b.badge_id}
                  className="flex flex-col items-center rounded-2xl bg-[#FAF6EC] p-2 text-center"
                >
                  <span aria-hidden className="text-[20px] text-gold">
                    {def.icon}
                  </span>
                  <p className="mt-1 font-serif text-[10px] leading-tight text-navy">
                    {def.title}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-center font-serif text-[18px] italic text-navy/65">
        You are not who you were when you closed your eyes.
      </p>
      <p className="text-center font-sans text-[11px] uppercase tracking-[0.22em] text-navy/45">
        — BJF
      </p>
    </main>
  );
}

function PulseLine({ pulses }: { pulses: number[] }) {
  if (pulses.length === 0) return null;
  const width = 320;
  const height = 80;
  const min = 1;
  const max = 10;
  const step = pulses.length > 1 ? width / (pulses.length - 1) : width;
  const points = pulses
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 block w-full"
      role="img"
      aria-label="Mood over time"
    >
      <polyline
        points={points}
        stroke="#7C8B6E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill="rgba(124,139,110,0.12)"
        stroke="none"
      />
    </svg>
  );
}
