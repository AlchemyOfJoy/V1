/**
 * Bottom-of-Home recap — what the user has done today already.
 *
 * Builds visible momentum: "I logged my pulse, I closed the day, I
 * added something to my list." Each check is a small reward for
 * already showing up.
 */

interface Props {
  pulseLogged: boolean;
  challengeDayLogged: boolean;
  ittLoopClosed: boolean;
  joyItemsAddedToday: number;
}

export default function TodaysWins({
  pulseLogged,
  challengeDayLogged,
  ittLoopClosed,
  joyItemsAddedToday,
}: Props) {
  const wins: { done: boolean; label: string }[] = [
    { done: challengeDayLogged, label: "Day logged" },
    { done: pulseLogged, label: "Joy Pulse" },
    { done: ittLoopClosed, label: "ITT loop closed" },
    {
      done: joyItemsAddedToday > 0,
      label:
        joyItemsAddedToday > 0
          ? `${joyItemsAddedToday} ${joyItemsAddedToday === 1 ? "joy added" : "joys added"}`
          : "Add a joy",
    },
  ];
  const doneCount = wins.filter((w) => w.done).length;
  if (doneCount === 0) return null;

  return (
    <section className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
        Today you&apos;ve done
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {wins.map((w) => (
          <li
            key={w.label}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[12px] ${
              w.done
                ? "bg-cyan-deep/10 text-cyan-deep"
                : "border border-dashed border-navy/15 text-navy/40"
            }`}
          >
            <span aria-hidden className="text-[11px]">
              {w.done ? "✓" : "○"}
            </span>
            {w.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
