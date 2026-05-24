/**
 * Soft wave / arc dividers used as section transitions. Replaces the
 * thin border lines that were making screens feel like spreadsheets.
 */

export function Wave({
  variant = "cyan",
  className = "",
}: {
  variant?: "cyan" | "gold" | "navy";
  className?: string;
}) {
  const color =
    variant === "gold"
      ? "#D4AF37"
      : variant === "navy"
        ? "#00171F"
        : "#007EA7";
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 24"
      preserveAspectRatio="none"
      className={`block h-3 w-full ${className}`}
    >
      <path
        d="M0 12 Q 150 0 300 12 T 600 12"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}

/** Three small dots used between section headers and content. */
export function Tridot({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex justify-center gap-1.5 text-gold ${className}`}
    >
      <span className="text-[8px]">✦</span>
      <span className="text-[6px] opacity-50">✦</span>
      <span className="text-[8px]">✦</span>
    </div>
  );
}
