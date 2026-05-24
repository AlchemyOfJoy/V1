import Link from "next/link";
import { TOTAL_DAYS } from "@/lib/challenge";

interface DayState {
  checked: boolean;
  amDone: boolean;
  pmDone: boolean;
}

export default function ChallengeCalendar({
  currentDay,
  states,
}: {
  currentDay: number;
  states: Record<number, DayState>;
}) {
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
  return (
    <div className="space-y-6">
      {Array.from({ length: 13 }, (_, w) => {
        const weekDays = days.filter(
          (d) => Math.ceil(d / 7) === w + 1 || (w === 12 && d > 84),
        );
        return (
          <div key={w} className="space-y-2">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Week {w + 1}
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((d) => {
                const s = states[d];
                const isToday = d === currentDay;
                const isFuture = d > currentDay;
                const completion =
                  s && s.checked
                    ? s.amDone && s.pmDone
                      ? "full"
                      : s.amDone || s.pmDone
                        ? "half"
                        : "logged"
                    : null;
                const base =
                  "flex h-12 items-center justify-center rounded-lg text-center font-sans text-[12px] font-semibold tabular-nums transition";
                let cls = "";
                if (completion === "full")
                  cls = "bg-cyan-deep text-white";
                else if (completion === "half")
                  cls = "bg-cyan-deep/45 text-white";
                else if (completion === "logged")
                  cls = "bg-mist text-cyan-deep";
                else if (isToday)
                  cls =
                    "border-2 border-cyan-deep bg-white text-cyan-deep";
                else if (isFuture)
                  cls = "bg-mist/60 text-navy/30";
                else cls = "bg-mist text-navy/55";
                return (
                  <Link
                    key={d}
                    href={`/curriculum/90-day-challenge/day/${d}`}
                    className={`${base} ${cls} hover:brightness-95`}
                    title={
                      isToday
                        ? `Day ${d} · Today`
                        : isFuture
                          ? `Day ${d} · Upcoming`
                          : `Day ${d}`
                    }
                  >
                    {d}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
