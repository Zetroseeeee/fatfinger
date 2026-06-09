/**
 * The pipeline "spider-web": a radial map of every capability, coloured by
 * status, around a central fatfinger. node - plus a grouped board beneath it.
 * Edit ROADMAP to change what shows. Pure/presentational.
 */
type Status = "shipped" | "live" | "next" | "later";

const STATUS: Record<Status, { color: string; label: string }> = {
  shipped: { color: "#0f9d63", label: "Shipped" },
  live: { color: "#3d5aff", label: "Live & self-running" },
  next: { color: "#e5342b", label: "Next up" },
  later: { color: "#8a8d94", label: "Later" },
};

const ROADMAP: { label: string; status: Status }[] = [
  { label: "Brand + site", status: "shipped" },
  { label: "Newsletter + charts", status: "shipped" },
  { label: "Daily AI writer", status: "live" },
  { label: "Auto-publish + send", status: "live" },
  { label: "Self-optimizing A/B", status: "live" },
  { label: "Attribution + pixels", status: "live" },
  { label: "Audio + light/dark", status: "shipped" },
  { label: "£50 ad launch", status: "next" },
  { label: "Pricing A/B test", status: "next" },
  { label: "Stripe payments", status: "next" },
  { label: "Social auto-poster", status: "later" },
  { label: "Multi-model engine", status: "later" },
];

export function Roadmap() {
  const cx = 460;
  const cy = 300;
  const r = 225;
  const n = ROADMAP.length;

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border-2 border-ink bg-ink p-4">
        <svg viewBox="0 0 920 600" className="w-full" role="img" aria-label="Project pipeline map">
          {/* spokes */}
          {ROADMAP.map((node, i) => {
            const a = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            return (
              <line
                key={`l${i}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.5}
              />
            );
          })}

          {/* nodes + labels */}
          {ROADMAP.map((node, i) => {
            const a = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            const right = x > cx + 20;
            const left = x < cx - 20;
            const anchor = right ? "start" : left ? "end" : "middle";
            const lx = x + (right ? 14 : left ? -14 : 0);
            const ly = y + (right || left ? 4 : y < cy ? -14 : 18);
            const c = STATUS[node.status].color;
            return (
              <g key={`n${i}`}>
                <circle cx={x} cy={y} r={7} fill={c} stroke="#0a0b0d" strokeWidth={2} />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  fill="#f4f4f5"
                  fontSize={13}
                  fontFamily="var(--font-mono), monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* center */}
          <circle cx={cx} cy={cy} r={40} fill="#0a0b0d" stroke="#e5342b" strokeWidth={2.5} />
          <text x={cx} y={cy + 6} textAnchor="middle" fill="#f4f4f5" fontSize={18} fontWeight={700}>
            fatfinger
            <tspan fill="#e5342b">.</tspan>
          </text>
        </svg>
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <span key={s} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[s].color }} />
            {STATUS[s].label}
          </span>
        ))}
      </div>

      {/* board */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <div key={s} className="rounded-2xl border-2 border-ink bg-paper p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[s].color }} />
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                {STATUS[s].label}
              </h3>
            </div>
            <ul className="mt-3 space-y-2">
              {ROADMAP.filter((r) => r.status === s).map((r) => (
                <li key={r.label} className="text-sm leading-snug text-ink">
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
