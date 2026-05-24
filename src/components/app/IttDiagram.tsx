/**
 * Visual rendering of the ITT Framework — three vertical pillars
 * (Invest in Joy / Train Your Brain / Take Bold Action) with the
 * flywheel arrow returning to the start. Used at the top of the
 * Journey tab and on marketing pages.
 *
 * SVG-only. No images. Scales cleanly from mobile to desktop.
 */

interface Props {
  active?: "invest" | "train" | "action";
  className?: string;
}

export default function IttDiagram({ active, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 600 240"
      className={`block w-full ${className}`}
      role="img"
      aria-label="The ITT Framework: Invest in Joy, Train Your Brain, Take Bold Action"
    >
      <defs>
        <linearGradient id="itt-pillar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FAF6EC" />
          <stop offset="100%" stopColor="#F3F0E4" />
        </linearGradient>
        <linearGradient id="itt-pillar-active" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#E0F1F8" />
          <stop offset="100%" stopColor="#C9E5F0" />
        </linearGradient>
        <marker
          id="itt-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="#007EA7" />
        </marker>
      </defs>

      {/* Flywheel arc */}
      <path
        d="M 80 200 Q 300 240 520 200"
        stroke="#007EA7"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        fill="none"
        opacity="0.45"
        markerEnd="url(#itt-arrow)"
      />

      {/* Three pillars */}
      {[
        { x: 60, key: "invest", label: "Invest", word: "Joy", n: "01" },
        { x: 230, key: "train", label: "Train", word: "Brain", n: "02" },
        { x: 400, key: "action", label: "Bold", word: "Action", n: "03" },
      ].map((p) => {
        const isActive = active === p.key;
        return (
          <g key={p.key}>
            <rect
              x={p.x}
              y={30}
              width={140}
              height={140}
              rx={14}
              fill={
                isActive ? "url(#itt-pillar-active)" : "url(#itt-pillar)"
              }
              stroke={isActive ? "#007EA7" : "#00171F"}
              strokeOpacity={isActive ? 0.5 : 0.12}
              strokeWidth={isActive ? 1.5 : 1}
            />
            <text
              x={p.x + 70}
              y={64}
              textAnchor="middle"
              fill={isActive ? "#007EA7" : "#00171F"}
              fillOpacity={isActive ? 1 : 0.45}
              fontFamily="ui-sans-serif, system-ui"
              fontSize="11"
              fontWeight="600"
              letterSpacing="2.5"
            >
              {p.n}
            </text>
            <text
              x={p.x + 70}
              y={108}
              textAnchor="middle"
              fill="#00171F"
              fontFamily="ui-serif, Georgia"
              fontSize="22"
              fontWeight="500"
            >
              {p.label}
            </text>
            <text
              x={p.x + 70}
              y={138}
              textAnchor="middle"
              fill="#007EA7"
              fontStyle="italic"
              fontFamily="ui-serif, Georgia"
              fontSize="22"
              fontWeight="500"
            >
              {p.word}
            </text>
          </g>
        );
      })}

      {/* Subtle sparkle accents */}
      <text x="200" y="40" textAnchor="middle" fill="#D4AF37" fontSize="10">
        ✦
      </text>
      <text x="380" y="40" textAnchor="middle" fill="#D4AF37" fontSize="10">
        ✦
      </text>
    </svg>
  );
}
