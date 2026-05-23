import Link from "next/link";
import { query, AssessmentRow } from "@/lib/db";
import { getBand } from "@/lib/questions";
import { btnPrimarySm } from "@/lib/ui";
import { Spark } from "@/components/icons";

/**
 * Dashboard tile showing the user's current JQ — or a baseline-take CTA
 * if they haven't taken it yet. The "nudge, don't gate" pattern: the
 * curriculum stays browsable; we just surface what's missing.
 */
export default async function JqTile({ userId }: { userId: string }) {
  const rows = await query<AssessmentRow>(
    "SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [userId],
  );
  const latest = rows[0];

  if (!latest) {
    return (
      <div className="rounded-2xl bg-navy p-6 text-white sm:p-7">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Your starting line
        </p>
        <h3 className="mt-3 font-serif text-[24px] font-medium leading-tight text-white">
          Take your <em className="text-cyan">baseline JQ</em>.
        </h3>
        <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-white/70">
          Five minutes. The number you&apos;ll measure your transformation
          against.
        </p>
        <Link
          href="/assessment?context=baseline"
          className={`${btnPrimarySm} mt-5`}
        >
          Take baseline
        </Link>
      </div>
    );
  }

  const band = getBand(latest.score);
  return (
    <div className="rounded-2xl bg-mist p-6 sm:p-7">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
        Your current JQ
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <div className="font-serif text-[44px] font-medium leading-none text-navy">
          {latest.score}
        </div>
        <div className="font-sans text-[14px] font-light text-navy/45">
          / 50
        </div>
      </div>
      <p
        className="mt-2 flex items-center gap-2 font-sans text-[12px] font-bold uppercase tracking-[0.14em]"
        style={{ color: band.color }}
      >
        <Spark size={12} />
        {band.label}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href="/assessment" className={btnPrimarySm}>
          Retake JQ
        </Link>
        <Link
          href="/dashboard"
          className="font-sans text-[13px] text-navy/70 transition-colors duration-150 hover:text-cyan-deep"
        >
          View history →
        </Link>
      </div>
    </div>
  );
}
