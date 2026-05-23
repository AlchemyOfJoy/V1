import { Spark } from "@/components/icons";
import { quoteOfTheDay } from "@/content/quotes";

export default function PullQuote() {
  const q = quoteOfTheDay();
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 shrink-0">
          <Spark size={14} />
        </span>
        <div>
          <p className="font-serif text-[18px] italic leading-snug text-navy">
            &ldquo;{q.quote}&rdquo;
          </p>
          <p className="mt-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-navy/55">
            — {q.attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
