import { GoldGlow, SparkleMark } from "./Sparkle";

export type CoachMode = "steady" | "reverent" | "playful";
export type CoachSize = "compact" | "hero";

export interface CoachCardProps {
  mode?: CoachMode;
  size?: CoachSize;
  body: React.ReactNode;
  attribution?: string;
  source?: string;
  eyebrow?: string;
  className?: string;
}

const MODE_BG: Record<CoachMode, string> = {
  steady: "bg-[#FAF6EC] border-gold/30",
  reverent: "bg-navy/[0.03] border-navy/20",
  playful: "bg-gradient-to-br from-[#FAF6EC] via-white to-mist border-cyan-deep/25",
};

export default function CoachCard({
  mode = "steady",
  size = "compact",
  body,
  attribution = "BJF",
  source,
  eyebrow,
  className,
}: CoachCardProps) {
  const isHero = size === "hero";

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border ${MODE_BG[mode]} ${
        isHero ? "px-7 py-9 sm:px-10 sm:py-11" : "px-6 py-5"
      } ${className ?? ""}`}
    >
      {isHero && <GoldGlow />}
      {isHero && (
        <SparkleMark
          size={36}
          className="absolute right-6 top-6 text-gold/60"
        />
      )}

      <div className="relative">
        {eyebrow && (
          <p
            className={`font-sans font-semibold uppercase tracking-[0.22em] text-cyan-deep ${
              isHero ? "text-[11px]" : "text-[10px]"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <div
          className={`font-serif text-navy ${
            isHero
              ? "mt-4 text-[24px] leading-[1.45] sm:text-[28px] sm:leading-[1.4]"
              : "mt-2 text-[18px] leading-[1.6] italic"
          }`}
        >
          {isHero ? (
            <>
              <span className="text-gold">&ldquo;</span>
              {body}
              <span className="text-gold">&rdquo;</span>
            </>
          ) : (
            body
          )}
        </div>
        <p
          className={`font-sans uppercase tracking-[0.22em] text-navy/55 ${
            isHero ? "mt-6 text-[11px]" : "mt-3 text-[10px]"
          }`}
        >
          — {attribution}
          {source && (
            <span className="text-navy/35"> · {source}</span>
          )}
        </p>
      </div>
    </article>
  );
}
