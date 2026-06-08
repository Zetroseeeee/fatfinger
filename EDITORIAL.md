# Fat Finger - Editorial & Brand Bible

> The single source of truth for how Fat Finger **sounds** and **looks**. Read this
> before writing any copy, building any section, or designing any chart. If a
> change conflicts with this doc, this doc wins (or update this doc deliberately).

---

## 1. What Fat Finger is

A finance-media brand: the sharpest, wittiest read on markets, energy and macro.
Think **Litquidity / Exec Sum - but with a commodities-and-energy edge and a quant
brain.**

**The funnel:** free social cards + site (reach) → a free morning newsletter (the
core product) → a premium quant/macro tier later.

**The promise:** understand what actually moved the market in **5 minutes**, and
sound like the smartest person on the desk.

**Tagline:** _"fat finger (n.) - the slip that moves markets. also: your sharpest
read on them."_

---

## 2. Who it's for

Traders, bankers, PE/hedge-fund people, finance students, and the markets-curious.
Young, scroll-native, screenshot-happy. Smart and time-poor - they hate fluff and
hate being talked down to. **Win them with speed, wit, and a genuine edge.**

---

## 3. The edge - what we talk about

- Breaking markets & macro, **decoded - not just reported.**
- **Commodities & energy: oil, gas, power, metals, and the money plumbing nobody
  else covers. THIS IS OUR SIGNATURE BEAT - lead with it more than competitors do.**
- The numbers that move the tape, in plain English.
- One genuinely funny/weird market story every issue - the literal "fat finger":
  an absurd trade, a typo that moved millions, a ridiculous market moment.
- Every story ends with the macro/commodity **"so what."**

---

## 4. Voice & writing rules (most important)

**Smart but irreverent: Bloomberg's brain, a trader's mouth, a comedian's timing.**

- Short sentences. Active voice. **Lead with the hook or the number.**
- One idea per line. Skimmable. Generous whitespace.
- **THE SIGNATURE DEVICE - "the take":** every story ends with ONE sharp sentence,
  ideally a memorable analogy, that says what it MEANS.
  e.g. _"Compute is the new oil, and even Google is renting it."_
- Wit comes from **specificity and analogy**, never forced puns.
- No jargon without a 3-word plain-English unpack.
- Never condescending, never hype-y, never "BREAKING:" clickbait. Confident, dry,
  occasionally savage.
- **Bold the key number; put all data/tickers in mono.**
- **NO EM DASHES (—).** They read as AI-written. Use a period (best, for two
  punchy clauses), a comma, a colon, or parentheses instead. For mono separators
  (datelines, footers) use a mid-dot ` · `. This applies to all copy, everywhere.

**Readability bar:** if a sentence needs re-reading, cut it. No paragraph over 3
sentences. A smart 16-year-old should get the gist; a markets pro should respect
the depth.

**Example headlines** (Anton, uppercase - mix hard + funny):

- "GOOGLE IS PAYING SPACEX $920M A MONTH TO BORROW COMPUTE"
- "OPEC+ ADDED 188,000 BARRELS. THE MARKET NEEDED 10 MILLION."
- "SOMEONE FAT-FINGERED A MULTI-BILLION TRADE AND MOVED THE INDEX"
- "BITCOIN HAD ITS WORST WEEK IN MONTHS. THE MAXIS BLAMED AI."

**Example takes:**

- "Context beats clickbait: this is a rounding error dressed as a policy shift."
- "When the safe-haven trade is crypto, there is no safe haven."

---

## 5. The newsletter (core product - structure + style)

A most-mornings markets brief. Clean, **dark**, mobile-first email/web template.
Anatomy:

1. **MASTHEAD** - "fatfinger." wordmark, the date (IBM Plex Mono), and a one-line
   "market mood" ("Risk-off and grumpy.").
2. **THE TAPE** - compact market snapshot row/table: indices, WTI/Brent, gold, BTC,
   10Y, DXY - each with ▲/▼ (**▲ white, ▼ red**) and mono numbers.
3. **THE BIG SLIP** - the lead story (2–4 short paragraphs) + the take.
4. **THE DESK** - 4–6 rapid-fire bullets, each a one-liner + a mini take.
5. **ENERGY DESK** - the commodities/energy signature section (1–2 items + take).
6. **FAT FINGER OF THE DAY** - the funny/weird market item.
7. **CHART OF THE DAY** - one chart + a one-line caption-take.
8. **SIGN-OFF** - a dry one-liner + a share/subscribe CTA.

Footer: **"Not investment advice."** + socials.

**Style:** dark `#0a0b0d`, off-white text, **red ONLY for emphasis and ▼**, Anton
section headers, Poppins body, IBM Plex Mono for every number/label, thin red/gray
dividers between sections.

> Note: the newsletter is dark even though the marketing **site** is light "paper".
> They are two different surfaces; keep the newsletter dark per this spec.

---

## 6. Charts & graphs (design spec - reusable components)

Make them look like a **refined Bloomberg terminal, not Excel:**

- Dark/transparent background (`#0a0b0d` / `#0f1115`). Off-white (`#f5f5f6`) text.
  Muted gray (`#8b9099`) for secondary data and gridlines (thin, very low opacity).
- **SIGNAL RED `#E5342B` HIGHLIGHTS ONLY THE ONE THING THE STORY IS ABOUT** - the
  key series, bar, or point. Everything else stays muted. This is the whole trick:
  the eye goes straight to the point.
- Fonts: **Anton** for the chart title, **IBM Plex Mono** for axes, ticks, value
  callouts.
- Every chart has: a short title, a one-line **"take" subtitle**, a red dot/marker
  + mono label on the key point, and a mono **"SOURCE: X"** footer.
- Prefer **line** (price/time), **bar** (comparison), simple **area**. No pie charts
  unless unavoidable (then mono+red). No 3D, no decorative gradients, no legend if
  a direct label works.
- Use **Recharts**, wrapped in ONE themed `<FatFingerChart>` so every chart is
  consistent.
- Use clearly-labelled **illustrative/placeholder data** for now
  (`// TODO: swap in real feeds`). **Never imply live prices.**

---

## 7. Guardrails

- Put a **source line** on every story and chart.
- Keep the **"Not investment advice."** footer.
- Illustrative data only - never imply a live feed.

---

## 8. Brand tokens & where things live (implementation)

**Palette** - defined in `src/app/globals.css` under Tailwind v4 `@theme`:

| Token | Hex | Use |
|---|---|---|
| `--color-paper` | `#f7f5ef` | marketing site canvas (light) |
| `--color-paper-2` | `#efece1` | recessed paper surface |
| `--color-ink` | `#0a0b0d` | text on paper / **newsletter + chart canvas (dark)** |
| `--color-ink-soft` | `#56585e` | muted body / captions on paper |
| `--color-signal` | `#e5342b` | THE red - emphasis, ▼, the one chart highlight |
| `--color-up` | `#0f9d63` | green up-ticks (site ticker) |
| `--color-electric` | `#3d5aff` | electric-blue accent block (site only) |

Chart/newsletter dark surface also uses `#0f1115` (panel) and `#8b9099` (muted
gray) - see `src/lib/chart-theme.ts`.

**Fonts** (next/font in `src/app/layout.tsx`): Anton = headlines (`font-display`),
Poppins = body + the `fatfinger.` wordmark (`font-body`), IBM Plex Mono =
labels/numbers/tickers (`font-mono`).

**Wordmark:** lowercase `fatfinger.` in Poppins bold (NOT Anton) with a **red
full-stop**.

**Layout map:**

- Marketing site (light paper) → `src/app/page.tsx` + `src/components/sections/*`
- Newsletter template (dark) → `src/components/newsletter/*`
- Sample issues (content as data) → `src/content/issues/*`, rendered at
  `/issues` (index) and `/issues/[slug]`
- Charts → `src/components/charts/fat-finger-chart.tsx` (themed Recharts wrapper)

**Note on registries:** the three shadcn registries in the original brief (Skiper /
Cult / Watermelon) serve SPA HTML, not JSON, to non-browser clients - every
"registry" component here is a hand-built brand equivalent. Don't try to
`shadcn add` them.
