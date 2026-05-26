import Link from "next/link";
import { query } from "@/lib/db";
import { JOS_COMPONENTS, type JosState } from "@/lib/jos";

/**
 * Per-component status row (JOS-First §14). Each component shows its
 * current state — last edited, score history, item count — and a
 * deep-link to edit / re-read / re-score.
 */
export default async function JosStatus({
  userId,
  jos,
}: {
  userId: string;
  jos: JosState;
}) {
  // One round-trip for the bits we need to describe each component
  const [latestJq, baselineJq, lastNarrative, lastEulogy, joyCount, lastPillar, lastSubscript] =
    await Promise.all([
      query<{ score: number; created_at: string | Date }>(
        `SELECT score, created_at FROM assessments
           WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId],
      ),
      query<{ score: number }>(
        `SELECT score FROM assessments
           WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
        [userId],
      ),
      query<{ updated_at: string | Date }>(
        `SELECT updated_at FROM worksheet_responses
           WHERE user_id = $1 AND worksheet_id = '02_core_narrative'
           LIMIT 1`,
        [userId],
      ),
      query<{ updated_at: string | Date }>(
        `SELECT updated_at FROM worksheet_responses
           WHERE user_id = $1 AND worksheet_id = '02_self_eulogy'
           LIMIT 1`,
        [userId],
      ),
      query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
        [userId],
      ),
      query<{ taken_at: string | Date }>(
        `SELECT taken_at FROM priority_pillar_snapshots
           WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 1`,
        [userId],
      ),
      query<{ updated_at: string | Date }>(
        `SELECT updated_at FROM subscripts
           WHERE user_id = $1 ORDER BY version DESC LIMIT 1`,
        [userId],
      ),
    ]);

  function statusFor(id: string): string {
    switch (id) {
      case "jq_baseline":
        if (!latestJq[0]) return "Not yet taken";
        if (baselineJq[0] && baselineJq[0].score !== latestJq[0].score) {
          return `Score: ${baselineJq[0].score} → ${latestJq[0].score}`;
        }
        return `Score: ${latestJq[0].score}`;
      case "core_narrative":
        return lastNarrative[0]
          ? `Last edited ${formatRel(lastNarrative[0].updated_at)}`
          : "Not yet written";
      case "self_eulogy":
        return lastEulogy[0]
          ? `Last edited ${formatRel(lastEulogy[0].updated_at)}`
          : "Not yet written";
      case "list_of_joy":
        return `${joyCount[0]?.c ?? 0} entries`;
      case "priority_pillars":
        return lastPillar[0]
          ? `Last scored ${formatRel(lastPillar[0].taken_at)}`
          : "Not yet scored";
      case "subscript":
        return lastSubscript[0]
          ? `Last edited ${formatRel(lastSubscript[0].updated_at)}`
          : "Not yet built";
    }
    return "";
  }

  return (
    <ul className="divide-y divide-slate/15">
      {JOS_COMPONENTS.map((c) => {
        const padded = String(c.number).padStart(2, "0");
        const installed = jos.components_completed.includes(c.id);
        return (
          <li key={c.id}>
            <Link
              href={c.primaryHref}
              className="flex items-center gap-5 py-4 transition hover:text-cyan"
            >
              <span
                aria-hidden
                className="font-serif text-[20px] italic leading-none text-slate"
              >
                {padded}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[14px] font-semibold text-navy">
                  {c.name}
                </p>
                <p className="mt-0.5 font-sans text-[12px] text-slate">
                  {statusFor(c.id)}
                </p>
              </div>
              {installed ? (
                <span
                  aria-hidden
                  className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-cyan"
                >
                  Installed
                </span>
              ) : (
                <span
                  aria-hidden
                  className="font-sans text-[10px] uppercase tracking-[0.22em] text-slate/55"
                >
                  Pending
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function formatRel(value: string | Date): string {
  const ms = new Date(value).getTime();
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}
