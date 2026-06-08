# CLAUDE.md - Fat Finger

Working notes for this repo. **Read [`EDITORIAL.md`](./EDITORIAL.md) first** - it is
the brand bible (voice, structure, chart spec, palette). All copy and design work
must stay on-brand per that doc.

## What this is

Marketing site + dark newsletter template for **Fat Finger**, a markets/energy/macro
media brand. Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 ·
Framer Motion · Recharts.

## Voice in one line

Bloomberg's brain, a trader's mouth, a comedian's timing. Short sentences, lead with
the number, **every story ends with one sharp "take"** (an analogy that says what it
means). Signature beat = **commodities & energy**. See EDITORIAL.md §4.

## Two surfaces, two palettes

- **Marketing site** = light "paper" (`#f7f5ef`), oversized Anton, colour blocks
  (red/green/electric), editorial. `src/app/page.tsx` + `src/components/sections/*`.
- **Newsletter + charts** = **dark** (`#0a0b0d`), off-white text, **red used only for
  emphasis and ▼**. `src/components/newsletter/*`, `src/components/charts/*`,
  issues at `/issues`.

Tokens live in `src/app/globals.css @theme`. Fonts: Anton=`font-display`,
Poppins=`font-body` (+ wordmark), IBM Plex Mono=`font-mono` (all numbers/tickers).

## Conventions

- Charts: always go through `<FatFingerChart>`. ONE signal-red series/point, rest
  muted. Title (Anton) + take subtitle + `SOURCE:` footer. Illustrative data only,
  marked `// TODO: swap in real feeds` - never imply live prices.
- Every story/chart gets a source line; keep the "Not investment advice." footer.
- Hand-built "registry" components (Skiper/Cult/Watermelon equivalents) - don't
  `shadcn add`; the registries serve HTML not JSON here.

## Commands

- `npm run dev` - dev server (http://localhost:3000)
- `npm run build` - prod build + typecheck (run before declaring done)

## Gotchas

- npm here throws intermittent `ECONNRESET`; retry installs in a loop (each retry
  caches more) with `--maxsockets=2`.
- Preview screenshotter only captures reliably at `scrollY 0`; scroll-in reveals
  won't have fired mid-page. To shoot lower sections: set a tall viewport + capture
  at scroll 0 (everything in view fires the reveals).
