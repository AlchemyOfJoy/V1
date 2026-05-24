/**
 * The ✦ sparkle motif used throughout the app. Two variants:
 *   - Inline (text-sized) for prose accents
 *   - Decorative (sized + positioned absolutely) for hero cards
 */

export function SparkleInline({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-block text-gold ${className}`}>
      ✦
    </span>
  );
}

export function SparkleMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SparkleCluster({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 80"
      className={`pointer-events-none ${className}`}
    >
      <g fill="currentColor" opacity={0.5}>
        <path d="M20 30 L21 36 L27 37 L21 38 L20 44 L19 38 L13 37 L19 36 Z" />
      </g>
      <g fill="currentColor" opacity={0.9}>
        <path d="M70 15 L72 25 L82 27 L72 29 L70 39 L68 29 L58 27 L68 25 Z" />
      </g>
      <g fill="currentColor" opacity={0.35}>
        <path d="M100 50 L101 56 L107 57 L101 58 L100 64 L99 58 L93 57 L99 56 Z" />
      </g>
    </svg>
  );
}

/** A soft gold→cream radial bloom used behind hero quotes. */
export function GoldGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          "radial-gradient(60% 60% at 50% 30%, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 35%, transparent 70%)",
      }}
    />
  );
}
