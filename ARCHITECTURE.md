# Fat Finger - Architecture

The plan for running Fat Finger **self-hosted**: own the site, the list, the
reading experience, and (later) the payments. The only thing we don't build is
raw mail deliverability - Resend owns that. See [`EDITORIAL.md`](./EDITORIAL.md)
for voice/design.

> Status: the **site + web archive are built and live-able today**. Email,
> database, live data and payments are scaffolded with clean seams and `// TODO`s
> - they switch on when the env keys in [`.env.example`](./.env.example) are set
> at deploy. Nothing is half-wired; with no keys the app runs and the funnel works.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Site / web archive | **Next.js 16** (App Router) | already built; owns brand + SEO + the reading experience |
| Email sending | **Resend** | sends **React components as email** - our `NewsletterIssue` becomes the actual email, so web + inbox never drift |
| Subscriber DB | **Supabase or Neon** (Postgres) | own the list + data; cheap, serverless |
| Live market data | CoinGecko (crypto, no key) + a keyed feed for stocks/commodities | top ticker only; editorial charts stay illustrative |
| Payments (premium tier) | **Stripe** | quant/macro paid tier; Checkout + webhooks |

## The one big idea: one template, two surfaces

`src/components/newsletter/newsletter-issue.tsx` renders the **web archive page**
(`/issues/[slug]`) **and** the **email** (via Resend + `@react-email`). Issue
content lives as data in `src/content/issues.ts`. Write once → publish to both.
This is the competitive edge: most newsletters maintain a separate, drifting email
template. We don't.

## Flows

**Subscribe (double opt-in)** - `POST /api/subscribe` (built, scaffolded):
1. validate email + honeypot
2. upsert subscriber `status: 'pending'` → Postgres
3. send confirmation email (Resend) with a tokenised link
4. `GET /api/confirm?token=…` flips them to `confirmed` *(TODO)*

**Publish an issue** *(TODO)*: render `NewsletterIssue` → Resend broadcast to
`confirmed` subscribers; the same data already powers the web archive.

**Live ticker** *(TODO, launch flip)*: `GET /api/ticker` fetches feeds server-side
(no CORS, key stays server), caches ~30–60s, normalises to the ticker shape;
`TickerBar` polls it with the current curated set as the fallback so it never
renders broken.

**Premium tier** *(TODO)*: Stripe Checkout → webhook marks subscriber `premium` →
gate premium issues / sections.

## Conventions

- No secrets in client code. Data-fetching + keys live in route handlers / server.
- Props crossing Server→Client must be serializable (e.g. chart formatters are
  `valuePrefix/valueSuffix/valueDecimals`, not functions).
- Editorial chart/newsletter data stays **illustrative** (`// TODO: swap in real
  feeds`); only the top ticker goes live. Keep the "Not investment advice." footer.
