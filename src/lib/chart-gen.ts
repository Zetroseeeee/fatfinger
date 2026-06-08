import type { FatFingerChartProps } from "@/components/charts/fat-finger-chart";

/**
 * The Fat Finger chart generator.
 *
 * The Skinny Finger Engine emits a loose chart spec (a type, a title, some
 * points, maybe a highlight). This layer turns that into a PERFECT, on-brand
 * FatFingerChartProps every single time, so every daily issue ships a chart that
 * obeys the house rules (EDITORIAL.md §6) no matter what the model returns:
 *
 *   • exactly one red point - the single number the story is about
 *   • a marker label generated from that value, formatted correctly
 *   • the move (up X% / down X%) baked into the title
 *   • sane decimals + axis for the magnitude of the data
 *   • bad/empty/garbage specs degrade safely instead of rendering broken
 *
 * Pure + deterministic, so it is trivially testable and never throws.
 */

export type RawPoint = { x: string; y: number };

export type RawChart = {
  type: "line" | "area" | "bar";
  title: string;
  take: string;
  source: string;
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
  highlightIndex?: number;
  markerLabel?: string;
  data: RawPoint[];
};

const TYPES = new Set(["line", "area", "bar"]);

/** decimals that read right for the magnitude (prices vs. indices vs. rates) */
function inferDecimals(maxAbs: number): number {
  if (maxAbs >= 100) return 0; // indices, big prices
  if (maxAbs >= 10) return 1; // mid prices
  if (maxAbs >= 1) return 2; // single-digit prices, rates
  return 3; // sub-dollar
}

function formatValue(
  v: number,
  prefix: string,
  decimals: number,
  suffix: string
): string {
  return `${prefix}${v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

/** percentage move between two points (sign preserved) */
export function chartMovePct(
  data: RawPoint[],
  fromIdx = 0,
  toIdx = data.length - 1
): number {
  const a = data[fromIdx]?.y;
  const b = data[toIdx]?.y;
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0) return 0;
  return ((b - a) / Math.abs(a)) * 100;
}

/** Turn a raw engine chart spec into a perfected, render-ready chart. */
export function normalizeChart(raw: Partial<RawChart> | undefined): FatFingerChartProps {
  // 1. clean the data: keep only points with a label and a finite numeric value
  const data: RawPoint[] = (raw?.data ?? [])
    .filter((p) => p != null && p.x != null && Number.isFinite(Number(p.y)))
    .map((p) => ({ x: String(p.x), y: Number(p.y) }));
  const n = data.length;

  // 2. chart type (fall back to line for time-series-shaped data)
  const type = raw?.type && TYPES.has(raw.type) ? raw.type : "line";

  // 3. value formatting, sanity-corrected for magnitude
  const prefix = raw?.valuePrefix ?? "";
  const suffix = raw?.valueSuffix ?? "";
  const maxAbs = n ? Math.max(...data.map((d) => Math.abs(d.y))) : 0;
  let decimals =
    typeof raw?.valueDecimals === "number"
      ? raw.valueDecimals
      : inferDecimals(maxAbs);
  if (maxAbs >= 1000 && decimals > 0) decimals = 0; // never "$1,234.00"
  if (maxAbs > 0 && maxAbs < 10 && decimals === 0) decimals = 2; // never "$3" for $3.92
  decimals = Math.max(0, Math.min(4, decimals));

  // 4. the one red point: default to the latest (most stories end "now"); clamp
  let highlightIndex = raw?.highlightIndex;
  if (
    typeof highlightIndex !== "number" ||
    highlightIndex < 0 ||
    highlightIndex >= n
  ) {
    highlightIndex = n ? n - 1 : 0;
  }

  // 5. marker label: generate from the highlighted value if the model left it off
  let markerLabel = (raw?.markerLabel ?? "").trim();
  if (!markerLabel && n) {
    markerLabel = formatValue(data[highlightIndex].y, prefix, decimals, suffix);
  }

  // 6. title: bake the move into it ("... (up 19%)") - but only for a trend.
  // A bar chart compares categories, so a first-to-last "move" is meaningless.
  let title = (raw?.title ?? "").trim() || "Chart of the day";
  if (type !== "bar" && n >= 2 && !/%/.test(title)) {
    const pct = chartMovePct(data, 0, highlightIndex);
    const move =
      pct >= 0.5
        ? `up ${Math.round(Math.abs(pct))}%`
        : pct <= -0.5
          ? `down ${Math.round(Math.abs(pct))}%`
          : "flat";
    title = `${title} (${move})`;
  }

  return {
    type,
    title,
    take: (raw?.take ?? "").trim(),
    source: (raw?.source ?? "").trim() || "SOURCE: illustrative",
    data,
    xKey: "x",
    yKey: "y",
    highlightIndex,
    markerLabel: markerLabel || undefined,
    valuePrefix: prefix || undefined,
    valueSuffix: suffix || undefined,
    valueDecimals: decimals,
  };
}
