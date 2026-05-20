interface Point {
  score: number;
  date: string;
}

const W = 620;
const H = 260;
const PAD_L = 38;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 34;
const MIN = 10;
const MAX = 50;

export default function ScoreChart({ data }: { data: Point[] }) {
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const x = (i: number) =>
    PAD_L + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (score: number) =>
    PAD_T + plotH - ((score - MIN) / (MAX - MIN)) * plotH;

  const points = data.map((d, i) => ({ cx: x(i), cy: y(d.score), ...d }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.cx},${p.cy}`)
    .join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].cx},${PAD_T + plotH} L${points[0].cx},${PAD_T + plotH} Z`
      : "";

  const gridLines = [10, 20, 30, 40, 50];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Joy Quotient score history chart"
    >
      <defs>
        <linearGradient id="jqArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g) => (
        <g key={g}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={y(g)}
            y2={y(g)}
            stroke="#f3e3c8"
            strokeWidth="1"
          />
          <text
            x={PAD_L - 8}
            y={y(g) + 4}
            textAnchor="end"
            fontSize="11"
            fill="#a8a29e"
          >
            {g}
          </text>
        </g>
      ))}

      {areaPath && <path d={areaPath} fill="url(#jqArea)" />}
      {points.length > 1 && (
        <path
          d={linePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {points.map((p, i) => {
        const anchor =
          points.length > 1 && i === 0
            ? "start"
            : points.length > 1 && i === points.length - 1
              ? "end"
              : "middle";
        return (
          <g key={i}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r="5"
              fill="#fff"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <text
              x={p.cx}
              y={p.cy - 12}
              textAnchor={anchor}
              fontSize="11"
              fontWeight="700"
              fill="#b45309"
            >
              {p.score}
            </text>
            <text
              x={p.cx}
              y={H - 12}
              textAnchor={anchor}
              fontSize="10"
              fill="#a8a29e"
            >
              {p.date}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
