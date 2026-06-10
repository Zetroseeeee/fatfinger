/**
 * The catalog of admin-controllable settings. Add a field here and it shows up
 * in /admin automatically with the right control. `wired: true` marks the ones
 * that already change the live site; the rest are stored and one line from being
 * wired wherever you want them.
 */
export type Field =
  | { key: string; label: string; type: "toggle"; default: boolean; help?: string; wired?: boolean }
  | { key: string; label: string; type: "text"; default: string; help?: string; wired?: boolean }
  | { key: string; label: string; type: "number"; default: number; help?: string; wired?: boolean }
  | { key: string; label: string; type: "select"; default: string; options: string[]; help?: string; wired?: boolean };

export type Group = { id: string; title: string; blurb: string; fields: Field[] };

export const SETTINGS: Group[] = [
  {
    id: "content",
    title: "Content engine",
    blurb: "How the daily issue is written, published and sent.",
    fields: [
      { key: "autoPublish", label: "Auto-publish to the site", type: "toggle", default: true, wired: true, help: "Each morning's issue appears on /issues on its own." },
      { key: "autoSend", label: "Auto-email the list", type: "toggle", default: true, wired: true, help: "The issue emails itself to confirmed subscribers." },
      { key: "weekdaysOnly", label: "Weekdays only", type: "toggle", default: true },
      { key: "publishHour", label: "Publish time (UTC)", type: "select", default: "11", options: ["5", "6", "7", "8", "11", "12", "13"] },
      { key: "defaultMood", label: "Default mood line", type: "text", default: "Risk-off and twitchy" },
      { key: "includeChart", label: "Include a chart", type: "toggle", default: true },
      { key: "includeFatFinger", label: "Include 'Fat Finger of the day'", type: "toggle", default: true },
      { key: "maxStories", label: "Stories on the desk", type: "number", default: 6 },
    ],
  },
  {
    id: "site",
    title: "Site",
    blurb: "Sitewide switches and the announcement banner.",
    fields: [
      { key: "announcementOn", label: "Show announcement banner", type: "toggle", default: false, wired: true },
      { key: "announcementText", label: "Announcement text", type: "text", default: "", wired: true, help: "Shows as a thin bar across the top of every page." },
      { key: "maintenanceMode", label: "Maintenance mode", type: "toggle", default: false },
      { key: "showTicker", label: "Show the price ticker", type: "toggle", default: true },
      { key: "showSampleIssues", label: "Show sample issues in the archive", type: "toggle", default: true },
      { key: "tagline", label: "Tagline", type: "text", default: "Markets, energy and macro. Decoded, not reported." },
      { key: "footerNote", label: "Footer note", type: "text", default: "Not investment advice." },
    ],
  },
  {
    id: "growth",
    title: "Growth & testing",
    blurb: "A/B behaviour, attribution and ad pixels.",
    fields: [
      { key: "heroCtaOverride", label: "Hero button text (override)", type: "text", default: "", wired: true, help: "Leave blank to let the A/B test choose." },
      { key: "abAutoPromote", label: "Auto-promote the A/B winner", type: "toggle", default: true, wired: true },
      { key: "abConfidence", label: "Confidence to promote", type: "select", default: "95", options: ["90", "95", "99"] },
      { key: "abMinSignups", label: "Min signups before deciding", type: "number", default: 30 },
      { key: "pixelsEnabled", label: "Fire ad conversion pixels", type: "toggle", default: true },
      { key: "utmDefaultCampaign", label: "Default UTM campaign", type: "text", default: "" },
      { key: "referralProgram", label: "Referral program", type: "toggle", default: false },
    ],
  },
  {
    id: "email",
    title: "Email",
    blurb: "Sender identity and opt-in behaviour.",
    fields: [
      { key: "fromName", label: "From name", type: "text", default: "Fat Finger" },
      { key: "replyTo", label: "Reply-to address", type: "text", default: "" },
      { key: "doubleOptIn", label: "Require email confirmation", type: "toggle", default: true },
      { key: "welcomeEmail", label: "Send a welcome email", type: "toggle", default: false },
      { key: "unsubFooter", label: "Unsubscribe footer line", type: "text", default: "You can unsubscribe any time." },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    blurb: "Reading experience and brand styling.",
    fields: [
      { key: "defaultTheme", label: "Default reading theme", type: "select", default: "dark", options: ["dark", "light"], wired: true },
      { key: "accent", label: "Accent colour", type: "select", default: "signal red", options: ["signal red", "electric", "green"] },
      { key: "showAudioButton", label: "Show the Listen button", type: "toggle", default: true },
      { key: "fontScale", label: "Reading font size", type: "select", default: "normal", options: ["compact", "normal", "comfy"] },
      { key: "chartStyle", label: "Chart style", type: "select", default: "minimal", options: ["minimal", "detailed"] },
      { key: "grain", label: "Paper grain texture", type: "toggle", default: true },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    blurb: "Indexing, caching and data.",
    fields: [
      { key: "robotsIndex", label: "Allow search indexing", type: "toggle", default: true },
      { key: "cacheTtl", label: "Cache TTL (seconds)", type: "number", default: 300 },
      { key: "debugBanner", label: "Show debug banner", type: "toggle", default: false },
      { key: "dataRetentionDays", label: "Purge unconfirmed after (days, 0 = never)", type: "number", default: 0 },
    ],
  },
];

export function settingDefaults(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const g of SETTINGS) for (const f of g.fields) out[f.key] = f.default;
  return out;
}
