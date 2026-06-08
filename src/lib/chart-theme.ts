/**
 * Fat Finger chart palette - "refined Bloomberg terminal, not Excel".
 * Dark canvas, off-white text, muted gray for everything secondary, and the
 * ONE signal red reserved for the single thing the chart is about.
 * See EDITORIAL.md §6.
 */
export const CHART = {
  /** transparent so charts sit on the dark newsletter/site panels */
  bg: "transparent",
  panel: "#0f1115",
  ink: "#0a0b0d",
  text: "#f5f5f6",
  /** secondary data + axis labels */
  muted: "#8b9099",
  /** gridlines: thin, very low opacity */
  grid: "rgba(139,144,153,0.16)",
  /** the highlight - use sparingly, one thing per chart */
  signal: "#e5342b",
} as const;
