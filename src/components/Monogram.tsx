/**
 * BF monogram — a faithful recreation of the Brent Freeman brand mark
 * (geometric "B" with the signature spark). Renders in `currentColor`
 * so it can sit on navy (bone) or on bone (navy) per the brand guide.
 */
export default function Monogram({
  size = 26,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={(size * 118) / 104}
      height={size}
      viewBox="0 0 118 104"
      fill="none"
      role="img"
      aria-label="Brent Freeman"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="square"
        fill="none"
      >
        <path d="M24 14 V94" />
        <path d="M24 14 H46 a20 20 0 0 1 0 40 H24" />
        <path d="M24 54 H50 a21 21 0 0 1 0 42 H24" />
      </g>
      <path
        d="M94 6 L98 16 L108 20 L98 24 L94 34 L90 24 L80 20 L90 16 Z"
        fill="currentColor"
      />
    </svg>
  );
}
