# Fat Finger — launch in ~15 minutes (your part)

Everything else is automatic (see `AUTONOMY.md`). This is the short list of things
only a human can do: paste the keys, and launch one small ad campaign. £50 gets
you roughly 15-50 real signups and, more importantly, the data the site needs to
start optimizing itself.

For a £50 test with no audience yet, **Google Search beats Meta** — you buy
intent (people literally googling "energy newsletter"), it converts at tiny
budgets, and it needs no algorithm "learning phase". So: one Google Search
campaign on cheap, high-intent energy keywords.

---

## Part 1 — paste the keys into Vercel (5 min, one time)

Vercel → your project → Settings → Environment Variables (Production), then
Redeploy:

- `DATABASE_URL` — Supabase pooler string (you have it)
- `RESEND_API_KEY` + `EMAIL_FROM="Fat Finger <brief@fatfinger.news>"`
- `MARKET_DATA_API_KEY` — Twelve Data (you have it)
- `NEXT_PUBLIC_SITE_URL="https://www.fatfinger.news"`
- `ANTHROPIC_API_KEY` + `CRON_SECRET` — for the auto-writer + auto-optimizer
- `NEXT_PUBLIC_GA_ID` — a free GA4 measurement id (so Google can optimize to signups)
- (optional) `AB_DASH_KEY` — to lock the `/ab` dashboard

That's it. From here the writer, the nightly A/B optimizer, prices, and tracking
all run on their own.

## Part 2 — launch the £50 Google campaign (10 min)

1. **Create a Google Ads account** at ads.google.com, add your card. (Skip the
   "Smart campaign" guided setup — switch to **Expert mode**.)
2. **New campaign → Goal: Leads → Type: Search.** Turn OFF "Search Network
   partners" and "Display Network".
3. **Locations:** United States + United Kingdom. **Language:** English.
4. **Budget:** £7/day. (Google caps at ~£50/week, so run it 7 days then pause or
   scale.) **Bidding:** "Maximize conversions" (no target CPA yet).
5. **Keywords** (paste, set match type to phrase by wrapping in "quotes"):
   ```
   "energy newsletter"
   "oil markets newsletter"
   "commodities newsletter"
   "energy markets analysis"
   "natural gas market news"
   "crude oil newsletter"
   "markets newsletter"
   "daily market newsletter"
   "free finance newsletter"
   ```
6. **Negative keywords** (Campaign → Keywords → Negative, paste):
   ```
   jobs job career salary hiring intern internship course courses class
   certification degree mba login app software platform terminal "free pdf"
   "free book" template excel spreadsheet pricing scam reddit youtube podcast
   "signal service" "stock tips" "penny stocks" "day trading course"
   "forex signals" "crypto signals" robinhood broker "how to trade" "trading bot"
   ```
7. **The ad** (Responsive Search Ad). Final URL — use this exact tagged link so it
   shows up in your `/ab` dashboard:
   ```
   https://www.fatfinger.news/subscribe?utm_source=google&utm_medium=cpc&utm_campaign=energy-launch
   ```
   **Headlines** (paste all):
   ```
   The Markets, In 5 Minutes
   The Energy Story No One Ran
   A Free Daily Markets Brief
   The Number That Moved It
   Oil, Gas, Power. Decoded.
   No Jargon. No Fluff. Free.
   Read It Before The Open
   Quant Brain, Trader's Mouth
   Subscribe Free, Daily Brief
   The Brief With An Edge
   ```
   **Descriptions** (paste all):
   ```
   Oil, gas, power and metals, decoded. The commodities story nobody else runs. Free daily.
   What actually moved the market, in 5 minutes. One brief a day. Free, no jargon.
   Bloomberg's brain, a trader's mouth. Every story ends with one sharp take. Subscribe free.
   One 5-minute brief before the open. Free, daily, unsubscribe anytime.
   ```
8. **Conversion tracking** (so the £50 optimizes toward signups, not clicks):
   link GA4 to Google Ads (Tools → Linked accounts), then import the `sign_up`
   event as a conversion. The site already fires it on every signup.
9. **Launch.**

## After launch — what happens on its own

- The Google algorithm optimizes toward signups (the `sign_up` conversion fires
  automatically).
- Every signup is tagged `google / energy-launch` and shows up at `/ab`.
- The nightly optimizer A/B-tests the site copy and auto-promotes the winner.
- Check `/ab` after a few days. If cost-per-subscriber is under ~£3, scale the
  daily budget. If a keyword spends with no signups, pause it. That's the whole job.

Full channel-by-channel plan + creative once you're ready to scale: `GROWTH.md`.
