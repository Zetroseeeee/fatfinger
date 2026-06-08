# Deploy Fat Finger to fatfinger.news

Stack: **Vercel** (hosting + the API routes) · **Supabase** (Postgres subscribers)
· **Resend** (email) · **Stripe** (premium tier, later). The app is deploy-ready
today: with no keys it runs and the funnel works; each key lights up a feature.

> What needs a human (not codeable here): your Vercel login, your Supabase/Resend/
> Stripe accounts, and DNS access for fatfinger.news. Steps below are the whole job.

## 1. Push the repo

```bash
git init && git add -A && git commit -m "Fat Finger"
# create a GitHub repo, then:
git remote add origin git@github.com:<you>/fatfinger.git
git push -u origin main
```

## 2. Vercel

1. vercel.com → **New Project** → import the GitHub repo. It auto-detects Next.js
   (no config needed; build `next build`, output handled for you).
2. **Settings → Environment Variables** → add the keys from `.env.example`
   (only fill what you have; the rest stay empty and degrade gracefully).
3. Deploy. You get a `*.vercel.app` URL immediately.

## 3. Custom domain fatfinger.news

1. Vercel → **Settings → Domains** → add `fatfinger.news` and `www.fatfinger.news`.
2. At your registrar, set the records Vercel shows you (apex `A 76.76.21.21`, or
   the recommended `CNAME`/nameserver option Vercel offers). SSL is automatic.
3. Set `NEXT_PUBLIC_SITE_URL=https://fatfinger.news` in Vercel env. (metadataBase
   already points there.)

## 4. Supabase (subscribers DB)

1. supabase.com → new project → copy the Postgres connection string into
   `DATABASE_URL` on Vercel.
2. SQL editor → run:

```sql
create table if not exists subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  status      text not null default 'pending', -- pending | confirmed | unsubscribed
  tier        text not null default 'free',     -- free | premium
  token       text,                             -- double opt-in token
  created_at  timestamptz not null default now(),
  confirmed_at timestamptz
);
create index if not exists subscribers_status_idx on subscribers (status);
```

3. Fill the two `// TODO`s in `src/app/api/subscribe/route.ts` (insert pending row,
   send confirmation) and add a `GET /api/confirm?token=…` route that flips
   `status` to `confirmed`.

## 5. Resend (email)

1. resend.com → add + **verify the fatfinger.news domain** (SPF/DKIM TXT records at
   your registrar — Resend gives them to you). This is what makes email land in
   inboxes.
2. Copy the API key into `RESEND_API_KEY`; set `EMAIL_FROM="Fat Finger
   <brief@fatfinger.news>"`.
3. `npm i resend @react-email/components`. Send `NewsletterIssue` (or a slim
   confirm email) via `resend.emails.send({ react: … })` — same React template the
   web archive uses.

## 6. Live ticker

Works on deploy with zero config (crypto via CoinGecko + macro via Yahoo, cached
30s in `/api/ticker`). For bulletproof macro at scale, add a keyed feed
(Twelve Data / Finnhub) behind `MARKET_DATA_API_KEY` and swap the Yahoo branch.

## 7. Stripe (premium tier, when ready)

`npm i stripe @stripe/stripe-js`. Add the `STRIPE_*` keys, a Checkout session
route, and a webhook that flips `subscribers.tier` to `premium`. Gate premium
issues/sections on that column.

---

Order of operations for a fast launch: **1 → 2 → 3** gets the site live on
fatfinger.news. Add **4 + 5** to turn on real signups + email. **7** whenever you
start charging.
