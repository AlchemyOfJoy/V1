import Link from "next/link";
import { btnPrimary } from "@/lib/ui";
import type { UpNext } from "@/lib/up-next";

/**
 * The "Up Next" surface (Build Directive §8.1) — renders the single
 * highest-priority next-step. Used for the cases TodayCard doesn't
 * cover: delivered letters, no-arc users, maintenance, the fallback.
 *
 * Visual: always has one unmistakable primary action. Eyebrow + title +
 * subtitle. Milestone variants get gold treatment.
 */
export default function UpNextCard({ next }: { next: UpNext }) {
  const milestone = next.isMilestone === true;
  const letter = next.kind === "letter";
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${
        letter
          ? "border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] via-white to-[#FAF6EC]"
          : milestone
            ? "border-[#C89A3F]/40 bg-gradient-to-br from-[#FAF6EC] via-white to-[#FAF6EC]"
            : "border-cyan-deep/25 bg-gradient-to-br from-white via-mist/60 to-mist"
      }`}
    >
      {(letter || milestone) && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#C89A3F]/15 blur-2xl"
        />
      )}
      <div className="relative">
        <p
          className={`font-sans text-[10px] font-semibold uppercase tracking-[0.24em] ${
            letter || milestone ? "text-[#8a6d00]" : "text-cyan-deep"
          }`}
        >
          {next.eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-[24px] font-medium leading-tight text-navy sm:text-[26px]">
          {next.title}
        </h2>
        {next.subtitle && (
          <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-navy/70">
            {next.subtitle}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={next.href} className={btnPrimary}>
            {next.primaryLabel} →
          </Link>
          {typeof next.estimatedMin === "number" && (
            <span className="font-sans text-[11px] tabular-nums text-navy/45">
              ~{next.estimatedMin} min
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
