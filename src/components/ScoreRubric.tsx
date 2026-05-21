import { BANDS, getBand } from "@/lib/questions";
import { Spark } from "@/components/icons";

/** The JQ scoring rubric — all four bands, with the user's band highlighted. */
export default function ScoreRubric({ score }: { score: number }) {
  const current = getBand(score);
  return (
    <div>
      <h3 className="font-serif text-[20px] font-medium text-navy">
        What your score means
      </h3>
      <div className="mt-4 space-y-2">
        {BANDS.map((b) => {
          const on = b.label === current.label;
          return (
            <div
              key={b.label}
              className={`flex gap-4 rounded-xl border p-4 ${
                on
                  ? "border-cyan bg-cyan/[0.05]"
                  : "border-navy/10 bg-white"
              }`}
            >
              <div className="w-14 shrink-0 font-serif text-[19px] font-semibold text-navy">
                {b.min}–{b.max}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-sans text-[12px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: b.color }}
                  >
                    {b.label}
                  </span>
                  {on && (
                    <span className="flex items-center gap-1 font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-cyan">
                      <Spark size={11} />
                      Your score
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                  {b.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
