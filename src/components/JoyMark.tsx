export default function JoyMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="4.4" fill="#ff9500" />
      <g
        stroke="#ff9500"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.92"
      >
        <line x1="12" y1="1.8" x2="12" y2="4.4" />
        <line x1="12" y1="19.6" x2="12" y2="22.2" />
        <line x1="1.8" y1="12" x2="4.4" y2="12" />
        <line x1="19.6" y1="12" x2="22.2" y2="12" />
        <line x1="4.6" y1="4.6" x2="6.5" y2="6.5" />
        <line x1="17.5" y1="17.5" x2="19.4" y2="19.4" />
        <line x1="19.4" y1="4.6" x2="17.5" y2="6.5" />
        <line x1="6.5" y1="17.5" x2="4.6" y2="19.4" />
      </g>
    </svg>
  );
}
