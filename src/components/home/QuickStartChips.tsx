import Link from "next/link";

/**
 * "I have…" — three time-boxed entry points on Home so the first
 * thing the user sees is "what's possible right now," not a wall of
 * options. Lifted directly from the spec's "make one thing obvious"
 * principle.
 */

const CHIPS: { time: string; label: string; href: string; glyph: string }[] = [
  {
    time: "60 seconds",
    label: "Joy Spark",
    href: "/curriculum/module/04-bold-action/joy-spark",
    glyph: "✦",
  },
  {
    time: "5 minutes",
    label: "Reset Breath",
    href: "/curriculum/module/04-bold-action/60-second-reset",
    glyph: "⌇",
  },
  {
    time: "20 minutes",
    label: "Reframe Ritual",
    href: "/curriculum/module/04-bold-action/reframe-now",
    glyph: "↻",
  },
];

export default function QuickStartChips() {
  return (
    <section>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
        I have…
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {CHIPS.map((c) => (
          <li key={c.time}>
            <Link
              href={c.href}
              className="group flex h-full flex-col items-center rounded-2xl border border-navy/12 bg-white px-3 py-4 text-center transition hover:border-cyan-deep/40"
            >
              <span
                aria-hidden
                className="text-[18px] text-cyan-deep"
              >
                {c.glyph}
              </span>
              <p className="mt-2 font-serif text-[14px] font-medium leading-tight text-navy">
                {c.time}
              </p>
              <p className="mt-0.5 font-sans text-[11px] font-light text-navy/55">
                {c.label}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
