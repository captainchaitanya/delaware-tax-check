type QuarterRingProps = {
  done: number;
  total: number;
};

export function QuarterRing({ done, total }: QuarterRingProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const ratio = total === 0 ? 0 : done / total;
  const offset = circumference * (1 - ratio);
  const label = total === 0 ? "No filings this quarter" : `${done} of ${total} marked done`;

  return (
    <div className="flex items-center gap-4">
      <svg
        viewBox="0 0 96 96"
        className="h-24 w-24"
        role="img"
        aria-label={label}
      >
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-line"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="52"
          textAnchor="middle"
          className="fill-foreground font-mono text-sm"
        >
          {total === 0 ? "—" : `${done}/${total}`}
        </text>
      </svg>
      <div>
        <p className="text-sm font-medium">This quarter</p>
        <p className="mt-1 text-sm leading-6 text-muted">{label}</p>
      </div>
    </div>
  );
}
