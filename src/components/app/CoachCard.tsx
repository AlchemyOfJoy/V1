/**
 * Coach Card — Brent's voice surfacing the right thought at the right
 * moment. Three voice modes (Steady / Reverent / Playful). Never
 * generative — every Coach Card body is curated content surfaced at the
 * right moment.
 *
 * Visual: soft cream background with faint gold border, quote in serif
 * italic, attribution "— BJF" in small caps, single subtle fade-in.
 */

export type CoachMode = "steady" | "reverent" | "playful";

export interface CoachCardProps {
  mode?: CoachMode;
  body: React.ReactNode;
  attribution?: string;
  source?: string;
  /** Optional eyebrow above the quote (e.g. "Today's Joy Drop"). */
  eyebrow?: string;
  className?: string;
}

const MODE_STYLES: Record<CoachMode, string> = {
  steady:
    "border-gold/35 bg-[#FAF6EC] text-navy",
  reverent:
    "border-navy/25 bg-navy/[0.04] text-navy",
  playful:
    "border-cyan-deep/30 bg-gradient-to-br from-[#FAF6EC] to-white text-navy",
};

export default function CoachCard({
  mode = "steady",
  body,
  attribution = "BJF",
  source,
  eyebrow,
  className,
}: CoachCardProps) {
  return (
    <article
      className={`relative rounded-3xl border px-6 py-5 animate-fade-in shadow-[0_1px_2px_rgba(0,23,31,0.04)] ${MODE_STYLES[mode]} ${className ?? ""}`}
    >
      {eyebrow && (
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
          {eyebrow}
        </p>
      )}
      <div
        className={`font-serif leading-[1.65] ${
          mode === "reverent"
            ? "text-[18px] italic text-navy/85"
            : "text-[19px] italic text-navy"
        } ${eyebrow ? "mt-2" : ""}`}
      >
        {body}
      </div>
      <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.22em] text-navy/55">
        — {attribution}
        {source ? <span className="text-navy/35"> · {source}</span> : null}
      </p>
    </article>
  );
}
