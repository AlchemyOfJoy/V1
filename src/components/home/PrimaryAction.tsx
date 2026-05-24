import Link from "next/link";

/**
 * The single primary action on Home — clean, one-shot, designed.
 * Adapts copy based on whether the user has a SubScript yet and
 * whether it's morning or evening.
 */

export default function PrimaryAction({
  hasSubscript,
  isMorning,
}: {
  hasSubscript: boolean;
  isMorning: boolean;
}) {
  if (!hasSubscript) {
    return (
      <Link
        href="/curriculum/module/02-joyful-operating-system/subscript"
        className="group relative block overflow-hidden rounded-3xl bg-navy p-6 text-white transition hover:bg-[#001F2A] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan-deep/30 blur-2xl"
        />
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan/80">
          The install starts here
        </p>
        <p className="mt-3 font-serif text-[26px] font-medium leading-tight sm:text-[30px]">
          Build your{" "}
          <em className="text-cyan">SubScript</em>
        </p>
        <p className="mt-3 max-w-md font-sans text-[14px] font-light leading-relaxed text-white/70">
          The keystone of the Joyful Operating System®. ~30 minutes.
        </p>
        <span className="mt-5 inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-cyan group-hover:gap-3 transition-all">
          Begin →
        </span>
      </Link>
    );
  }

  const label = isMorning ? "Morning SubScript" : "Evening SubScript";
  const note = isMorning
    ? "Read it before the day floods in."
    : "Read it once more before sleep.";

  return (
    <Link
      href="/curriculum/module/02-joyful-operating-system/subscript"
      className="group relative block overflow-hidden rounded-3xl border border-cyan-deep/25 bg-gradient-to-br from-white via-mist/60 to-mist p-6 transition hover:border-cyan-deep/50 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-deep">
            {label} · 5 min
          </p>
          <p className="mt-2 font-serif text-[24px] font-medium leading-tight text-navy sm:text-[28px]">
            Read it out{" "}
            <em className="text-cyan-deep">loud</em>.
          </p>
          <p className="mt-1 font-sans text-[13px] font-light text-navy/55">
            {note}
          </p>
        </div>
        <span className="shrink-0 self-center text-[28px] text-cyan-deep transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
