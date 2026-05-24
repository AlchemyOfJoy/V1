import type { Metadata } from "next";
import Link from "next/link";
import { JOURNEY, type IttPillar } from "@/lib/itt";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata: Metadata = {
  title: "Journey",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const PILLAR_BADGE: Record<IttPillar, string> = {
  foundations: "bg-mist text-navy/70",
  invest: "bg-gold/15 text-[#8a6d00]",
  train: "bg-cyan-deep/12 text-cyan-deep",
  action: "bg-[#d99a6c]/15 text-[#a16330]",
  integration: "bg-navy/8 text-navy",
};

export default async function JourneyPage() {
  const user = (await getCurrentUser())!;
  const completed = await query<{ worksheet_id: string }>(
    `SELECT worksheet_id FROM worksheet_responses
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [user.id],
  );
  const doneIds = new Set(completed.map((r) => r.worksheet_id));

  // Heuristic — a section is "complete" when its worksheet_id is in done.
  const sectionDone: Record<string, boolean> = {
    "core-narrative": doneIds.has("02_core_narrative"),
    "self-eulogy": doneIds.has("02_self_eulogy"),
    "list-of-joy": doneIds.has("02_list_of_joy"),
    "priority-pillars": doneIds.has("02_priority_pillars"),
    "subscript": doneIds.has("02_subscript"),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-8 sm:py-12">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          The ITT Framework
        </p>
        <h1 className="mt-2 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy sm:text-[46px]">
          Your <em className="text-cyan-deep">Journey</em>
        </h1>
        <p className="mt-3 max-w-xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
          Invest in Joy. Train Your Brain. Take Bold Action. Then run it
          for ninety days. Take it in order, or follow what&apos;s calling
          you.
        </p>
      </header>

      <ol className="space-y-6">
        {JOURNEY.map((pillar) => {
          const completeCount = pillar.sections.filter(
            (s) => sectionDone[s.id] === true,
          ).length;
          const totalCount = pillar.sections.length;
          const pct =
            totalCount === 0 ? 0 : Math.round((completeCount / totalCount) * 100);

          return (
            <li
              key={pillar.id}
              className="overflow-hidden rounded-3xl border border-navy/12 bg-white"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-3 px-5 pt-5">
                <div>
                  <p
                    className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] ${PILLAR_BADGE[pillar.id]}`}
                  >
                    {pillar.number === 0
                      ? "Foundations"
                      : `Pillar ${pillar.number}`}
                  </p>
                  <h2 className="mt-2 font-serif text-[26px] font-medium text-navy">
                    {pillar.title.split(pillar.italicWord)[0]}
                    <em className="text-cyan-deep">{pillar.italicWord}</em>
                    {pillar.title.split(pillar.italicWord)[1] ?? ""}
                  </h2>
                  <p className="mt-1 font-sans text-[14px] font-light text-navy/60">
                    {pillar.tagline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
                    Progress
                  </p>
                  <p className="font-serif text-[22px] font-medium tabular-nums text-navy">
                    {pct}%
                  </p>
                </div>
              </header>

              <p className="px-5 pt-3 font-sans text-[14px] font-light leading-relaxed text-navy/70">
                {pillar.description}
              </p>

              <div className="mx-5 mt-4 h-1 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full bg-cyan-deep transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <ul className="mt-4 divide-y divide-navy/8">
                {pillar.sections.map((section) => {
                  const done = sectionDone[section.id] === true;
                  return (
                    <li key={section.id}>
                      <Link
                        href={section.href}
                        className="flex items-start gap-4 px-5 py-3.5 transition hover:bg-mist/40"
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                            done
                              ? "bg-cyan-deep text-white"
                              : "bg-mist text-navy/50"
                          }`}
                          aria-hidden
                        >
                          {done ? "✓" : ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[17px] font-medium text-navy">
                            {section.title}
                          </p>
                          <p className="mt-0.5 font-sans text-[13px] font-light leading-relaxed text-navy/60">
                            {section.oneLiner}
                          </p>
                        </div>
                        <span className="self-center whitespace-nowrap font-sans text-[11px] text-navy/45">
                          {section.estimatedMin} min
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
