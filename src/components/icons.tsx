/**
 * Brand icon set — geometric line icons with Alchemy Gold spark accents.
 * Per the brand guide, sparkles are ALWAYS rendered in gold and never
 * recolored. Main strokes use `currentColor`.
 */

const GOLD = "#d4af37";

function Svg({
  size = 24,
  className,
  children,
}: {
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** A single 4-point Alchemy Gold spark — the brand's signature particle. */
export function Spark({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 0.6 L9.7 6.3 L15.4 8 L9.7 9.7 L8 15.4 L6.3 9.7 L0.6 8 L6.3 6.3 Z"
        fill={GOLD}
      />
    </svg>
  );
}

/** Triple Sparkle — the brand's default bullet / section divider motif. */
export function TripleSparkle({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className ?? ""}`}
      aria-hidden="true"
    >
      <Spark size={9} />
      <Spark size={14} />
      <Spark size={9} />
    </span>
  );
}

export function AssessmentIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <path d="M14.5 4.5H17a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h2.5" />
      <rect x="9" y="3" width="6" height="3.4" rx="1" />
      <path d="M8.6 12.4l2 2 3-3.4" />
      <path d="M8.6 17h4" />
      <path
        d="M18.4 2.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z"
        fill={GOLD}
        stroke="none"
      />
    </Svg>
  );
}

export function SaveIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <path d="M7 3.5h10a1 1 0 0 1 1 1V20.4a.6.6 0 0 1-.94.5L12 17.4l-5.06 3.5A.6.6 0 0 1 6 20.4V4.5a1 1 0 0 1 1-1z" />
      <path
        d="M12 7.4l.95 2.5 2.5.95-2.5.95-.95 2.5-.95-2.5-2.5-.95 2.5-.95z"
        fill={GOLD}
        stroke="none"
      />
    </Svg>
  );
}

export function GrowthIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <path d="M3.5 20.5h17" />
      <path d="M5 17l4.2-5 3.4 2.7L19 7.5" />
      <path
        d="M19 4.3l.7 1.85 1.85.7-1.85.7-.7 1.85-.7-1.85-1.85-.7 1.85-.7z"
        fill={GOLD}
        stroke="none"
      />
    </Svg>
  );
}

export function LatestIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.2" />
      <path
        d="M12 9.4l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"
        fill={GOLD}
        stroke="none"
      />
    </Svg>
  );
}

export function ChangeIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 16.5l5-5 3.5 3 6.5-7" />
      <path d="M14.5 7.5H19V12" />
      <path d="M4 20.5h16" strokeOpacity="0.35" />
    </Svg>
  );
}

export function CheckinsIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <path d="M19.5 9A8 8 0 0 0 5.5 6.5L3.5 8.5" />
      <path d="M3.5 4v4.5H8" />
      <path d="M4.5 15a8 8 0 0 0 14 2.5l2-2" />
      <path d="M20.5 20v-4.5H16" />
      <path
        d="M12 9.6l.65 1.75 1.75.65-1.75.65-.65 1.75-.65-1.75-1.75-.65 1.75-.65z"
        fill={GOLD}
        stroke="none"
      />
    </Svg>
  );
}

/** Decorative gold spark cluster for empty states. */
export function SparkCluster({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="56"
      viewBox="0 0 64 56"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M30 6l3.4 9.6L43 19l-9.6 3.4L30 32l-3.4-9.6L17 19l9.6-3.4z"
        fill={GOLD}
      />
      <path
        d="M48 24l2 5.6L56 32l-6 2.4L48 40l-2-5.6L40 32l6-2.4z"
        fill={GOLD}
        opacity="0.85"
      />
      <path
        d="M15 33l1.6 4.4L21 39l-4.4 1.8L15 45l-1.6-4.2L9 39l4.4-1.6z"
        fill={GOLD}
        opacity="0.7"
      />
    </svg>
  );
}
