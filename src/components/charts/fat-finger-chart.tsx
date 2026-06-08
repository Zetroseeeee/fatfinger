"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART } from "@/lib/chart-theme";
import { cn } from "@/lib/utils";

/**
 * FatFingerChart - the ONE themed Recharts wrapper. Every chart in the product
 * goes through here so they stay consistent (EDITORIAL.md §6):
 *   dark/transparent · off-white text · muted gridlines · ONE signal-red series
 *   or point · Anton title · mono axes · a "take" subtitle · SOURCE footer.
 *
 * Data is illustrative. // TODO: swap in real feeds - never imply live prices.
 */

type ChartType = "line" | "area" | "bar";

type Datum = Record<string, string | number>;

export interface FatFingerChartProps {
  type: ChartType;
  title: string;
  /** the one-line "take" - what the chart MEANS */
  take: string;
  source: string;
  data: Datum[];
  xKey: string;
  yKey: string;
  /** optional muted context series (line/area) drawn behind the red one */
  contextKey?: string;
  /** index of the key point (line/area marker) or the red bar */
  highlightIndex?: number;
  /** mono label shown at the highlighted point */
  markerLabel?: string;
  /** serializable value formatting (kept data-safe for Server→Client props) */
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
  height?: number;
  className?: string;
}

const axisTick = { fill: CHART.muted, fontSize: 11 } as const;

function ThemedTooltip({
  active,
  payload,
  label,
  fmt,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string | number;
  fmt: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[payload.length - 1]?.value;
  return (
    <div
      className="rounded-md border px-3 py-2 font-mono text-[11px]"
      style={{ background: CHART.panel, borderColor: CHART.grid, color: CHART.text }}
    >
      <div style={{ color: CHART.muted }}>{label}</div>
      <div style={{ color: CHART.signal }}>
        {typeof v === "number" ? fmt(v) : v}
      </div>
    </div>
  );
}

export function FatFingerChart({
  type,
  title,
  take,
  source,
  data,
  xKey,
  yKey,
  contextKey,
  highlightIndex,
  markerLabel,
  valuePrefix = "",
  valueSuffix = "",
  valueDecimals,
  height = 280,
  className,
}: FatFingerChartProps) {
  const hi =
    typeof highlightIndex === "number" ? data[highlightIndex] : undefined;

  const fmtVal = (v: number) =>
    `${valuePrefix}${
      typeof valueDecimals === "number" ? v.toFixed(valueDecimals) : v
    }${valueSuffix}`;

  // Padded y-domain so a line/area uses the panel's height instead of hugging
  // the top. Bars stay anchored at 0 (the honest baseline for magnitudes).
  const yNums = data.map((d) => Number(d[yKey])).filter((v) => Number.isFinite(v));
  const yMin = yNums.length ? Math.min(...yNums) : 0;
  const yMax = yNums.length ? Math.max(...yNums) : 1;
  const pad = (yMax - yMin) * 0.14 || Math.abs(yMax) * 0.05 || 1;
  const yDomain: [number | string, number | string] =
    type === "bar"
      ? [0, "auto"]
      : [yMin >= 0 ? Math.max(0, yMin - pad) : yMin - pad, yMax + pad];

  const common = (
    <>
      <CartesianGrid stroke={CHART.grid} strokeDasharray="2 4" vertical={false} />
      <XAxis
        dataKey={xKey}
        tick={axisTick}
        tickLine={false}
        axisLine={{ stroke: CHART.grid }}
        minTickGap={16}
      />
      <YAxis
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        width={44}
        domain={yDomain as never}
        tickFormatter={((v: number) => fmtVal(v)) as never}
      />
      <Tooltip
        cursor={{ stroke: CHART.muted, strokeDasharray: "3 3" }}
        content={<ThemedTooltip fmt={fmtVal} />}
      />
    </>
  );

  return (
    <figure
      className={cn(
        "ff-chart font-mono rounded-2xl border border-white/10 p-5",
        className
      )}
      style={{ background: CHART.panel }}
    >
      {/* title + take */}
      <figcaption className="mb-4">
        <h4 className="font-display text-xl uppercase leading-none tracking-tight text-[#f5f5f6]">
          {title}
        </h4>
        <p className="mt-1.5 text-[12px] leading-snug text-[#8b9099]">
          <span className="text-signal">›</span> {take}
        </p>
      </figcaption>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer minWidth={0} minHeight={0}>
          {type === "bar" ? (
            <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
              {common}
              <Bar dataKey={yKey} radius={[3, 3, 0, 0]} maxBarSize={42}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === highlightIndex ? CHART.signal : CHART.muted}
                    fillOpacity={i === highlightIndex ? 1 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={data} margin={{ top: 16, right: 40, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ffArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.signal} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={CHART.signal} stopOpacity={0} />
                </linearGradient>
              </defs>
              {common}
              {contextKey && (
                <Area
                  type="monotone"
                  dataKey={contextKey}
                  stroke={CHART.muted}
                  strokeWidth={1.5}
                  fill="transparent"
                  dot={false}
                  strokeOpacity={0.6}
                />
              )}
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={CHART.signal}
                strokeWidth={2.5}
                fill="url(#ffArea)"
                dot={false}
                activeDot={{ r: 4, fill: CHART.signal, stroke: CHART.panel }}
              />
              {hi && (
                <ReferenceDot
                  x={hi[xKey] as never}
                  y={hi[yKey] as never}
                  r={5}
                  fill={CHART.signal}
                  stroke={CHART.panel}
                  strokeWidth={2}
                  label={
                    markerLabel
                      ? {
                          value: markerLabel,
                          position: "top",
                          fill: CHART.text,
                          fontSize: 11,
                        }
                      : undefined
                  }
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 16, right: 40, left: 0, bottom: 0 }}>
              {common}
              {contextKey && (
                <Line
                  type="monotone"
                  dataKey={contextKey}
                  stroke={CHART.muted}
                  strokeWidth={1.5}
                  dot={false}
                  strokeOpacity={0.55}
                />
              )}
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={CHART.signal}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: CHART.signal, stroke: CHART.panel }}
              />
              {hi && (
                <ReferenceDot
                  x={hi[xKey] as never}
                  y={hi[yKey] as never}
                  r={5}
                  fill={CHART.signal}
                  stroke={CHART.panel}
                  strokeWidth={2}
                  label={
                    markerLabel
                      ? {
                          value: markerLabel,
                          position: "top",
                          fill: CHART.text,
                          fontSize: 11,
                        }
                      : undefined
                  }
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* source footer */}
      <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b9099]">
        {source}
      </p>
    </figure>
  );
}
