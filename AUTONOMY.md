# Fat Finger — what runs itself

The goal: the brand operates with as little human touch as possible. Here's the
honest split between what is fully autonomous, what can become autonomous, and
the few things that genuinely require a human (mostly: money).

## Runs itself today (Vercel cron + passive)

| Loop | How | Needs (one-time) |
|---|---|---|
| **Writes the daily issue** | `/api/cron/write-issue` (Skinny Finger Engine, Claude Opus 4.8) drafts a full in-voice issue every weekday morning | `ANTHROPIC_API_KEY`, `CRON_SECRET` |
| **Self-optimizing A/B** | `/api/cron/optimize` runs nightly: reads live conversion data, runs a two-proportion z-test, and **auto-promotes the winning variant at 95% confidence** to everyone. No human picks the winner. | `DATABASE_URL` |
| **Per-source attribution** | first-touch UTM + referrer captured on landing, attached to each signup, visible at `/ab` | `DATABASE_URL` |
| **Conversion pixels** | signup auto-fires Meta / Google / TikTok conversions so ad platforms self-optimize | the pixel IDs (only when running ads) |
| **Prices / ticker** | end-of-day market data, cached daily | `MARKET_DATA_API_KEY` |
| **Signup + double-opt-in email** | form → Supabase → Resend confirmation | `DATABASE_URL`, `RESEND_API_KEY` |
| **Traffic analytics** | Vercel Web Analytics (referrers, top pages, devices) | nothing |

## Can be made autonomous next (buildable, no money required)

- **Auto-publish the daily issue to the site** — the engine drafts today; flip it
  to publish so each morning's issue appears on `/issues` automatically (fresh
  daily content = SEO + return visits). Needs `/issues` made DB-backed.
- **Auto-send the daily issue to subscribers** — render the issue as an email and
  blast the confirmed list via Resend on the same cron. Needs an inline-styled
  issue email + unsubscribe link. (Moot until there's a list.)
- **Auto-post to social** — if you drop in each platform's API token, a cron can
  post the day's hook to X / LinkedIn / etc. automatically. Needs *your* tokens.

## Genuinely needs a human (the honest ceiling)

- **Paid ad spend.** No AI can (or should) charge your card and run your ad
  accounts unattended. `GROWTH.md` has every campaign written and ready to paste;
  you set the budget and hit launch. The site then measures and optimizes it all.
- **The one-time keys.** Anthropic, Supabase, Resend, Twelve Data, ad pixels.
  Once in Vercel, the loops above run on their own.

## TL;DR

Content writes itself. The site A/B-tests and optimizes itself. Attribution and
conversion tracking run themselves. The two things left to a human are **putting
money behind the ads** (your call, your card) and **pasting the keys in once**.
