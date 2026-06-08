import type { FatFingerChartProps } from "@/components/charts/fat-finger-chart";

/**
 * Sample newsletter issues - real, in-voice Fat Finger copy (EDITORIAL.md §4–5).
 * All numbers are ILLUSTRATIVE. // TODO: swap in real feeds. Never imply live data.
 */

export type Tick = {
  label: string;
  value: string;
  chg: string;
  dir: "up" | "down";
};

export type DeskItem = { headline: string; take: string };

export type EnergyItem = {
  headline: string;
  body: string;
  take: string;
  source: string;
};

export type Issue = {
  slug: string;
  date: string; // display, e.g. "Mon · Jun 8, 2026"
  preview: string; // archive blurb / email preview text
  mood: string; // one-line market mood
  tape: Tick[];
  bigSlip: {
    kicker: string;
    headline: string;
    paragraphs: string[];
    take: string;
    source: string;
  };
  desk: DeskItem[];
  energy: EnergyItem[];
  fatFinger: { headline: string; body: string; take: string; source: string };
  chart: FatFingerChartProps;
  signOff: string;
};

export const ISSUES: Issue[] = [
  // ───────────────────────────────────────────────────────────── Issue 1
  {
    slug: "opec-rounding-error",
    date: "Mon · Jun 8, 2026",
    preview:
      "OPEC+ added barrels nobody asked for, gas storage is filling too fast, and a junior trader found out what 'all' means.",
    mood: "Risk-off and grumpy.",
    tape: [
      { label: "S&P 500", value: "5,431", chg: "-0.42%", dir: "down" },
      { label: "Nasdaq", value: "19,004", chg: "-0.61%", dir: "down" },
      { label: "WTI", value: "$71.20", chg: "-2.10%", dir: "down" },
      { label: "Brent", value: "$74.65", chg: "-1.88%", dir: "down" },
      { label: "Gold", value: "$2,331", chg: "+0.30%", dir: "up" },
      { label: "BTC", value: "$67,920", chg: "-2.18%", dir: "down" },
      { label: "US 10Y", value: "4.28%", chg: "-3bp", dir: "down" },
      { label: "DXY", value: "104.6", chg: "+0.21%", dir: "up" },
    ],
    bigSlip: {
      kicker: "Energy · OPEC+",
      headline: "OPEC+ added 188,000 barrels. The market needed 10 million.",
      paragraphs: [
        "OPEC+ agreed to nudge output up by 188,000 barrels a day from July. The press release called it a careful return of supply. The tape called it a shrug.",
        "Oil fell anyway. Traders aren't worried about 188k barrels. They're worried about the demand behind them. China's imports are soft, US refiners are running lean, and diesel is flashing the warning it always does before growth scares.",
        "So a supply increase met a demand fear, and demand won. Brent slipped under $75 while the cartel insisted everything is fine.",
      ],
      take: "Context beats clickbait: this is a rounding error dressed as a policy shift.",
      source: "SOURCE: OPEC Secretariat · ICE Brent settlement",
    },
    desk: [
      {
        headline: "US 10-year yield slipped to 4.28% before the jobs print.",
        take: "Bonds are pricing a slowdown the equity desk is still pretending isn't there.",
      },
      {
        headline: "Gold ticked to a 3-week high as the dollar wobbled.",
        take: "The oldest trade on Earth still works when nothing else does.",
      },
      {
        headline: "Nvidia gave back 1.9% on a downgrade nobody believed.",
        take: "A sell rating on the most-owned stock alive is a press release, not a call.",
      },
      {
        headline: "Copper held $4.55 on grid-buildout demand.",
        take: "Every electrification story is secretly a copper story.",
      },
      {
        headline: "The yen touched 158 and Tokyo started clearing its throat.",
        take: "Intervention is a rumour until it's a candle.",
      },
    ],
    energy: [
      {
        headline: "European gas storage is filling a month early.",
        body: "EU inventories hit 71% in early June, weeks ahead of the five-year curve. A mild spring and weak industrial demand did the work no policy could.",
        take: "Full tanks in June are great news, unless you're the one who's long winter.",
        source: "SOURCE: GIE AGSI+ (illustrative)",
      },
      {
        headline: "US power prices jumped where the data centres are.",
        body: "PJM and ERCOT zones near new AI campuses are clearing well above the grid average. The load is real, it's lumpy, and it doesn't sleep.",
        take: "AI's first physical bottleneck isn't chips. It's the wire to the wall.",
        source: "SOURCE: PJM / ERCOT day-ahead (illustrative)",
      },
    ],
    fatFinger: {
      headline: "A junior trader learned what 'sell all' means.",
      body: "Asked to trim a position, a first-year keyed the whole book instead of the slice. For ninety seconds a quiet mid-cap printed like a meme stock before risk yanked the cord. The position was rebuilt by lunch; the nickname will outlive the bonus.",
      take: "Markets forgive the loss. The desk never forgets the story.",
      source: "SOURCE: a desk that asked us not to name it",
    },
    chart: {
      type: "area",
      title: "Brent crude, last 12 sessions",
      take: "The barrels were symbolic. The selloff wasn't.",
      source: "SOURCE: ICE Brent front-month · illustrative",
      data: [
        { d: "May 22", px: 79.1 },
        { d: "May 23", px: 78.6 },
        { d: "May 27", px: 78.9 },
        { d: "May 28", px: 77.8 },
        { d: "May 29", px: 78.2 },
        { d: "May 30", px: 77.1 },
        { d: "Jun 2", px: 76.9 },
        { d: "Jun 3", px: 77.4 },
        { d: "Jun 4", px: 76.2 },
        { d: "Jun 5", px: 76.0 },
        { d: "Jun 6", px: 75.3 },
        { d: "Jun 8", px: 74.65 },
      ],
      xKey: "d",
      yKey: "px",
      highlightIndex: 11,
      markerLabel: "$74.65 post-OPEC",
      valuePrefix: "$",
      valueDecimals: 0,
    },
    signOff:
      "That's the tape. Trade the demand, not the headline. And forward this to the colleague who still trusts press releases.",
  },

  // ───────────────────────────────────────────────────────────── Issue 2
  {
    slug: "compute-is-the-new-oil",
    date: "Thu · Jun 4, 2026",
    preview:
      "Google is renting compute by the launch, power demand is the new oil curve, and a fat finger added a zero to a Treasury block.",
    mood: "Greedy, with a compute hangover.",
    tape: [
      { label: "S&P 500", value: "5,468", chg: "+0.55%", dir: "up" },
      { label: "Nasdaq", value: "19,210", chg: "+0.92%", dir: "up" },
      { label: "WTI", value: "$73.40", chg: "+0.61%", dir: "up" },
      { label: "Brent", value: "$76.10", chg: "+0.48%", dir: "up" },
      { label: "Gold", value: "$2,318", chg: "-0.22%", dir: "down" },
      { label: "BTC", value: "$71,540", chg: "+1.40%", dir: "up" },
      { label: "US 10Y", value: "4.34%", chg: "+2bp", dir: "up" },
      { label: "Uranium", value: "$92.50", chg: "+3.1%", dir: "up" },
    ],
    bigSlip: {
      kicker: "AI · Power · Capex",
      headline: "Google is paying SpaceX $920M a month to borrow compute",
      paragraphs: [
        "The number doing the rounds is $920 million a month: a hyperscaler renting GPU capacity rather than waiting years to build it. Whether the exact figure holds, the shape of the deal is the story.",
        "The biggest companies on Earth have decided that owning the compute matters less than having it now. So they lease it, by the cluster, the way a wildcatter once leased a rig.",
        "And the thing every cluster needs is power. That's why the smart energy desks stopped reading chip roadmaps and started reading interconnection queues.",
      ],
      take: "Compute is the new oil, and even Google is renting it.",
      source: "SOURCE: company filings · reporting (illustrative figures)",
    },
    desk: [
      {
        headline: "Uranium broke $92 as utilities scrambled for 2027 supply.",
        take: "The market finally noticed that 'clean baseload' has a spot price.",
      },
      {
        headline: "Nasdaq printed a fresh high on three names.",
        take: "An index this top-heavy isn't a market, it's a watchlist.",
      },
      {
        headline: "The 2-year/10-year curve un-inverted, quietly.",
        take: "The recession everyone scheduled keeps missing its appointment.",
      },
      {
        headline: "Natural gas firmed on data-centre load forecasts.",
        take: "The 'bridge fuel' just got handed a much longer bridge.",
      },
      {
        headline: "A megacap announced a $9B buyback and a nuclear PPA.",
        take: "When your AI roadmap needs a power plant, you're an energy company now.",
      },
    ],
    energy: [
      {
        headline: "Power-purchase deals are the new land grab.",
        body: "Hyperscalers are signing decade-long contracts straight with nuclear and gas operators, locking megawatts before the grid can. The cleanest electron is the one you've already bought.",
        take: "They're not buying power. They're buying a place in the queue.",
        source: "SOURCE: utility PPA disclosures (illustrative)",
      },
    ],
    fatFinger: {
      headline: "Someone added a zero to a Treasury block. Twice.",
      body: "A dealer meant to sell $30M of the 10-year and sold $300M instead. Then, untangling it, fat-fingered the unwind the same way. Liquidity that looked deep at 9:00 was a rumour by 9:01. Two desks discovered the bid at the exact same second.",
      take: "Liquidity is a rumour until you need it.",
      source: "SOURCE: TRACE prints · primary-dealer chatter",
    },
    chart: {
      type: "bar",
      title: "Hyperscaler AI infra spend / month",
      take: "Renting compute at this run-rate is its own asset class.",
      source: "SOURCE: filings + estimates · illustrative",
      data: [
        { co: "Cloud A", spend: 540 },
        { co: "Cloud B", spend: 610 },
        { co: "Cloud C", spend: 480 },
        { co: "Google", spend: 920 },
        { co: "Cloud D", spend: 350 },
      ],
      xKey: "co",
      yKey: "spend",
      highlightIndex: 3,
      valuePrefix: "$",
      valueSuffix: "M",
    },
    signOff:
      "That's the tape. Follow the megawatts, not the memes. And send this to the friend who still thinks AI is a software story.",
  },

  // ───────────────────────────────────────────────────────────── Issue 3
  {
    slug: "no-safe-haven",
    date: "Tue · Jun 2, 2026",
    preview:
      "Bitcoin had its worst week in months, the maxis blamed AI, and a Nikkei typo moved an index for 90 seconds.",
    mood: "Hungover and looking for someone to blame.",
    tape: [
      { label: "S&P 500", value: "5,402", chg: "-0.30%", dir: "down" },
      { label: "Nasdaq", value: "18,980", chg: "-0.74%", dir: "down" },
      { label: "WTI", value: "$72.05", chg: "-0.40%", dir: "down" },
      { label: "Brent", value: "$75.20", chg: "-0.35%", dir: "down" },
      { label: "Gold", value: "$2,344", chg: "+0.88%", dir: "up" },
      { label: "BTC", value: "$63,180", chg: "-9.20%", dir: "down" },
      { label: "ETH", value: "$3,210", chg: "-7.10%", dir: "down" },
      { label: "DXY", value: "104.9", chg: "+0.34%", dir: "up" },
    ],
    bigSlip: {
      kicker: "Crypto · Macro",
      headline: "Bitcoin had its worst week in months. The maxis blamed AI.",
      paragraphs: [
        "Bitcoin shed roughly 9% in a week and slid back under $64,000. The explanations arrived faster than the bids: ETF outflows, a leverage flush, and, the crowd favourite, AI stocks 'stealing' the risk budget.",
        "Here's the simpler version. When rates tick up and the dollar firms, the most speculative thing in the room gets sold first. Right now that's crypto, not chips.",
        "Gold went up the same week. That's not a coincidence. That's the entire point.",
      ],
      take: "When the safe-haven trade is crypto, there is no safe haven.",
      source: "SOURCE: spot exchanges · ETF flow trackers (illustrative)",
    },
    desk: [
      {
        headline: "Gold tagged a record while crypto bled.",
        take: "One of these is 4,000 years old. It wasn't the one that fell.",
      },
      {
        headline: "Crypto liquidations topped a billion in a day.",
        take: "Leverage doesn't create losses. It just schedules them.",
      },
      {
        headline: "The VIX popped to 19 and went back to sleep.",
        take: "Fear with a snooze button isn't fear yet.",
      },
      {
        headline: "Oil drifted as the macro desk ignored crypto entirely.",
        take: "Barrels don't care what your wallet did this weekend.",
      },
    ],
    energy: [
      {
        headline: "Bitcoin miners pivoted rigs to AI inference.",
        body: "With block rewards thin, several listed miners are renting their power and racks to AI workloads. The cleanest hashrate is the one earning a second income.",
        take: "When mining stops paying, the megawatt finds a smarter tenant.",
        source: "SOURCE: miner operating updates (illustrative)",
      },
    ],
    fatFinger: {
      headline: "A trader fat-fingered an extra zero. The Nikkei did the rest.",
      body: "An order for 6,200 shares went in as 6,200,000. For about ninety seconds a major index believed the typo, printing a move worth billions in notional before a circuit breaker stepped in. The market didn't break. It just believed the mistake long enough to scare everyone.",
      take: "The market didn't break. It believed the typo for ninety seconds. That's the whole game.",
      source: "SOURCE: TSE order book · Bloomberg tape",
    },
    chart: {
      type: "line",
      title: "BTC vs gold, last 10 sessions",
      take: "The hedge that fell 9% was never the hedge.",
      source: "SOURCE: spot exchanges · LBMA · rebased, illustrative",
      data: [
        { d: "May 20", btc: 71.2, gold: 99.1 },
        { d: "May 21", btc: 70.4, gold: 99.4 },
        { d: "May 22", btc: 69.0, gold: 99.8 },
        { d: "May 23", btc: 68.1, gold: 100.2 },
        { d: "May 27", btc: 67.0, gold: 100.6 },
        { d: "May 28", btc: 66.2, gold: 101.0 },
        { d: "May 29", btc: 65.0, gold: 101.3 },
        { d: "May 30", btc: 64.4, gold: 101.9 },
        { d: "Jun 2", btc: 63.6, gold: 102.4 },
        { d: "Jun 3", btc: 63.18, gold: 102.9 },
      ],
      xKey: "d",
      yKey: "btc",
      contextKey: "gold",
      highlightIndex: 9,
      markerLabel: "BTC -9% on the week",
    },
    signOff:
      "That's the tape. Rent your convictions, don't marry them. And forward this to the maxi who needs to hear it.",
  },
];

export function getIssue(slug: string) {
  return ISSUES.find((i) => i.slug === slug);
}
