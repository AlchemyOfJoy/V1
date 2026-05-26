import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getJosState } from "@/lib/jos";
import { JOS_COMPONENTS } from "@/lib/jos-types";
import { query } from "@/lib/db";

export const metadata: Metadata = {
  title: "Your Joyful Operating System",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The JOS dashboard — Path B's home. Lists the 6 components with their
 * current state and a clear CTA per row. From here a user can:
 *
 *   • Open a component to revisit / edit / re-score
 *   • Re-take the JQ if they've done it before
 *   • See at a glance which components are still pending
 */
export default async function JosPage() {
  const user = (await getCurrentUser())!;

  const [jos, latestJq, baselineJq, lastNarrative, lastEulogy, joyCount, lastPillar, lastSubscript] =
    await Promise.all([
      getJosState(user.id),
      query<{ score: number; created_at: string | Date }>(
        `SELECT score, created_at FROM assessments
           WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [user.id],
      ),
      query<{ score: number }>(
        `SELECT score FROM assessments
           WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
        [user.id],
      ),
      query<{ updated_at: string | Date }>(
        `SELECT updated_at FROM worksheet_responses
           WHERE user_id = $1 AND worksheet_id = '02_core_narrative' LIMIT 1`,
        [user.id],
      ),
      query<{ updated_at: string | Date }>(
        `SELECT updated_at FROM worksheet_responses
           WHERE user_id = $1 AND worksheet_id = '02_self_eulogy' LIMIT 1`,
        [user.id],
      ),
      query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
        [user.id],
      ),
      query<{ taken_at: string | Date }>(
        `SELECT taken_at FROM priority_pillar_snapshots
           WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 1`,
        [user.id],
      ),
      query<{ updated_at: string | Date }>(
        `SELECT updated_at FROM subscripts
           WHERE user_id = $1 ORDER BY version DESC LIMIT 1`,
        [user.id],
      ),
    ]);

  function statusFor(id: string): { label: string; cta: string } {
    switch (id) {
      case "jq_baseline": {
        if (!latestJq[0]) return { label: "Not yet taken", cta: "Take it" };
        const start = baselineJq[0]?.score;
        const now = latestJq[0].score;
        const label =
          start !== undefined && start !== now
            ? `${start} → ${now}`
            : `Score: ${now}`;
        return { label, cta: "Re-take" };
      }
      case "core_narrative":
        return lastNarrative[0]
          ? { label: `Last edited ${rel(lastNarrative[0].updated_at)}`, cta: "Edit" }
          : { label: "Not yet written", cta: "Begin" };
      case "self_eulogy":
        return lastEulogy[0]
          ? { label: `Last edited ${rel(lastEulogy[0].updated_at)}`, cta: "Read" }
          : { label: "Not yet written", cta: "Begin" };
      case "list_of_joy":
        return { label: `${joyCount[0]?.c ?? 0} entries`, cta: "Browse" };
      case "priority_pillars":
        return lastPillar[0]
          ? { label: `Last scored ${rel(lastPillar[0].taken_at)}`, cta: "Re-score" }
          : { label: "Not yet scored", cta: "Score" };
      case "subscript":
        return lastSubscript[0]
          ? { label: `Last edited ${rel(lastSubscript[0].updated_at)}`, cta: "Read" }
          : { label: "Not yet built", cta: "Begin" };
    }
    return { label: "", cta: "Open" };
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
      <Link
        href="/home"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← Home
      </Link>

      <header className="mt-8">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          The foundation
        </p>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
          Your Joyful <em className="text-cyan">Operating System</em>.
        </h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-slate">
          Six living components. Editable forever. Yours.
        </p>
      </header>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-slate">
        {jos.components_completed.length} of 6 installed
        {jos.install_completed_at ? " · complete" : ""}
      </p>

      <ol className="mt-6 divide-y divide-slate/15">
        {JOS_COMPONENTS.map((c) => {
          const padded = String(c.number).padStart(2, "0");
          const installed = jos.components_completed.includes(c.id);
          const { label, cta } = statusFor(c.id);
          return (
            <li key={c.id}>
              <Link
                href={c.primaryHref}
                className="group flex items-start gap-6 py-6 transition hover:bg-slate/5"
              >
                <span
                  aria-hidden
                  className="font-serif text-[28px] italic leading-none text-gold"
                >
                  {padded}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">
                    {c.eyebrow}
                  </p>
                  <p className="mt-1 font-serif text-[22px] font-medium leading-tight text-navy">
                    {c.name}
                  </p>
                  <p className="mt-1 font-serif text-[15px] italic text-slate">
                    {c.description}
                  </p>
                  <p className="mt-2 font-sans text-[12px] text-slate">
                    {label}
                  </p>
                </div>
                <span
                  aria-hidden
                  className={`shrink-0 self-center font-sans text-[10px] font-bold uppercase tracking-[0.22em] transition ${
                    installed ? "text-cyan" : "text-navy"
                  }`}
                >
                  {cta} →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p aria-hidden className="mt-10 text-center text-[24px] text-gold">
        ✦
      </p>
    </main>
  );
}

function rel(value: string | Date): string {
  const ms = new Date(value).getTime();
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}
