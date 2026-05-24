/**
 * Gentle re-entry copy when a user is returning after a gap.
 *
 * Per tone guide: no streak shame, no "you broke X." Just a quiet
 * acknowledgment that the work is still here.
 */
export default function WelcomeBack({
  gapDays,
  currentDay,
}: {
  gapDays: number;
  currentDay: number;
}) {
  if (gapDays < 3) return null;

  return (
    <section className="rounded-2xl border border-[#C89A3F]/30 bg-[#FAF6EC] p-5">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6d00]">
        Welcome back
      </p>
      <p className="mt-2 font-serif text-[17px] italic leading-relaxed text-navy/75">
        {gapDays < 7
          ? `It’s been a few days. The work was here waiting.`
          : gapDays < 21
            ? `It’s been a couple of weeks. Pick up wherever feels right — no streak to recover.`
            : `Glad you’re back. The work is still here. You’re on Day ${currentDay} — start where you are.`}
      </p>
    </section>
  );
}
