import postgres from "postgres";
import type { Issue } from "@/content/issues";

/**
 * Postgres access (Supabase or Neon) via DATABASE_URL. Everything degrades
 * gracefully when DATABASE_URL is unset: `sql` is null, helpers return safe
 * defaults, and the app keeps working (the funnel just doesn't persist yet).
 *
 * For Vercel serverless + Supabase, use the TRANSACTION pooler URL (port 6543);
 * `prepare: false` is required for pgbouncer. SSL comes from the URL's sslmode.
 */
const url = process.env.DATABASE_URL;

// module-level singleton, reused across warm serverless invocations.
// `prepare: false` is required for Supabase's transaction pooler (pgbouncer);
// SSL is required by Supabase/Neon (skip only for a local Postgres).
const isLocal = !!url && /localhost|127\.0\.0\.1/.test(url);
export const sql = url
  ? postgres(url, {
      prepare: false,
      idle_timeout: 20,
      max: 3,
      ssl: isLocal ? false : "require",
    })
  : null;

export const hasDb = !!sql;

let schemaReady = false;

/** create the subscribers table on first use (idempotent) */
async function ensureSchema() {
  if (!sql || schemaReady) return;
  await sql`
    create table if not exists subscribers (
      id           uuid primary key default gen_random_uuid(),
      email        text unique not null,
      status       text not null default 'pending',
      tier         text not null default 'free',
      token        text,
      created_at   timestamptz not null default now(),
      confirmed_at timestamptz
    )
  `;
  // A/B arm + marketing attribution + unsubscribe token (idempotent)
  await sql`alter table subscribers add column if not exists ab text`;
  await sql`alter table subscribers add column if not exists src jsonb`;
  await sql`alter table subscribers add column if not exists unsub_token uuid default gen_random_uuid()`;
  schemaReady = true;
}

/** confirmed-subscriber count; 0 when no DB or on error */
export async function getSubscriberCount(): Promise<number> {
  if (!sql) return 0;
  try {
    await ensureSchema();
    const rows = await sql<{ n: number }[]>`
      select count(*)::int as n from subscribers where status = 'confirmed'
    `;
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

/** upsert a pending subscriber, returning the (new or existing) confirm token */
export async function upsertPending(
  email: string,
  token: string,
  ab?: string | null,
  src?: Record<string, unknown> | null
): Promise<{ created: boolean } | null> {
  if (!sql) return null;
  await ensureSchema();
  const srcJson = src ? JSON.stringify(src) : null;
  const rows = await sql<{ created: boolean }[]>`
    insert into subscribers (email, status, token, ab, src)
    values (${email}, 'pending', ${token}, ${ab ?? null}, ${srcJson}::jsonb)
    on conflict (email) do update
      set token = case
        when subscribers.status = 'pending' then ${token}
        else subscribers.token end,
        ab = coalesce(subscribers.ab, ${ab ?? null}),
        src = coalesce(subscribers.src, ${srcJson}::jsonb)
    returning (xmax = 0) as created
  `;
  return { created: rows[0]?.created ?? false };
}

export type SourceRow = { source: string; signups: number; confirmed: number };

/** signups grouped by first-touch marketing source (for /ab) */
export async function getSignupsBySource(): Promise<SourceRow[]> {
  if (!sql) return [];
  try {
    await ensureSchema();
    const rows = await sql<SourceRow[]>`
      select
        coalesce(nullif(src->>'source', ''), 'direct') as source,
        count(*)::int as signups,
        count(*) filter (where status = 'confirmed')::int as confirmed
      from subscribers
      group by 1
      order by 2 desc
      limit 30
    `;
    return rows;
  } catch {
    return [];
  }
}

// ── Self-optimizing A/B: promoted winners ─────────────────────────────────
let decisionsReady = false;
async function ensureDecisions() {
  if (!sql || decisionsReady) return;
  await sql`
    create table if not exists ab_decisions (
      experiment  text primary key,
      winner      text,           -- 'a' | 'b' | null (still testing)
      z           double precision,
      detail      jsonb,
      decided_at  timestamptz not null default now()
    )
  `;
  decisionsReady = true;
}

/** the promoted winner for an experiment, or null while still testing */
export async function getDecision(experiment: string): Promise<string | null> {
  if (!sql) return null;
  try {
    await ensureDecisions();
    const rows = await sql<{ winner: string | null }[]>`
      select winner from ab_decisions where experiment = ${experiment}
    `;
    return rows[0]?.winner ?? null;
  } catch {
    return null;
  }
}

// 60s in-memory cache so we don't hit the DB on every page render
let decisionCache: { at: number; map: Record<string, string | null> } = {
  at: 0,
  map: {},
};
export async function getDecisionCached(experiment: string): Promise<string | null> {
  const now = Date.now();
  if (now - decisionCache.at < 60_000 && experiment in decisionCache.map) {
    return decisionCache.map[experiment];
  }
  const w = await getDecision(experiment);
  decisionCache = {
    at: now,
    map: { ...(now - decisionCache.at < 60_000 ? decisionCache.map : {}), [experiment]: w },
  };
  return w;
}

export async function setDecision(
  experiment: string,
  winner: string | null,
  z: number,
  detail: unknown
): Promise<void> {
  if (!sql) return;
  try {
    await ensureDecisions();
    await sql`
      insert into ab_decisions (experiment, winner, z, detail)
      values (${experiment}, ${winner}, ${z}, ${JSON.stringify(detail)}::jsonb)
      on conflict (experiment) do update
        set winner = excluded.winner, z = excluded.z,
            detail = excluded.detail, decided_at = now()
    `;
    decisionCache = { at: 0, map: {} }; // bust cache
  } catch {
    /* best-effort */
  }
}

/** flip a subscriber to confirmed by token; returns the email or null */
export async function confirmByToken(token: string): Promise<string | null> {
  if (!sql) return null;
  try {
    await ensureSchema();
    const rows = await sql<{ email: string }[]>`
      update subscribers
        set status = 'confirmed', confirmed_at = now(), token = null
        where token = ${token} and status = 'pending'
      returning email
    `;
    return rows[0]?.email ?? null;
  } catch {
    return null;
  }
}

// ── Skinny Finger Engine drafts ───────────────────────────────────────────
let draftsReady = false;
async function ensureDrafts() {
  if (!sql || draftsReady) return;
  await sql`
    create table if not exists generated_issues (
      slug        text primary key,
      date        text not null,
      data        jsonb not null,
      status      text not null default 'published', -- draft | published
      created_at  timestamptz not null default now()
    )
  `;
  await sql`alter table generated_issues add column if not exists sent_at timestamptz`;
  draftsReady = true;
}

/** persist an engine-written issue (published by default for full autonomy) */
export async function saveGeneratedIssue(
  slug: string,
  date: string,
  data: unknown,
  status: "draft" | "published" = "published"
): Promise<boolean> {
  if (!sql) return false;
  try {
    await ensureDrafts();
    await sql`
      insert into generated_issues (slug, date, data, status)
      values (${slug}, ${date}, ${JSON.stringify(data)}::jsonb, ${status})
      on conflict (slug) do update
        set data = excluded.data, date = excluded.date, status = excluded.status
    `;
    return true;
  } catch {
    return false;
  }
}

/** published engine issues, newest first (for the live /issues archive) */
export async function getPublishedIssues(): Promise<Issue[]> {
  if (!sql) return [];
  try {
    await ensureDrafts();
    const rows = await sql<{ data: Issue }[]>`
      select data from generated_issues
      where status = 'published' order by created_at desc
    `;
    return rows.map((r) => r.data);
  } catch {
    return [];
  }
}

export async function getPublishedIssue(slug: string): Promise<Issue | null> {
  if (!sql) return null;
  try {
    await ensureDrafts();
    const rows = await sql<{ data: Issue }[]>`
      select data from generated_issues
      where slug = ${slug} and status = 'published' limit 1
    `;
    return rows[0]?.data ?? null;
  } catch {
    return null;
  }
}

/** has this issue already been emailed to the list? (send idempotency) */
export async function issueAlreadySent(slug: string): Promise<boolean> {
  if (!sql) return false;
  try {
    const rows = await sql<{ sent: boolean }[]>`
      select sent_at is not null as sent from generated_issues where slug = ${slug}
    `;
    return rows[0]?.sent ?? false;
  } catch {
    return false;
  }
}

export async function markIssueSent(slug: string): Promise<void> {
  if (!sql) return;
  try {
    await sql`update generated_issues set sent_at = now() where slug = ${slug}`;
  } catch {
    /* best-effort */
  }
}

export type Recipient = { email: string; unsub_token: string };

/** confirmed subscribers + their unsubscribe token (for the daily blast) */
export async function getConfirmedRecipients(): Promise<Recipient[]> {
  if (!sql) return [];
  try {
    await ensureSchema();
    return await sql<Recipient[]>`
      select email, unsub_token::text as unsub_token
      from subscribers where status = 'confirmed'
    `;
  } catch {
    return [];
  }
}

/** one-click unsubscribe by token; returns true if a row was updated */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!sql) return false;
  try {
    await ensureSchema();
    const rows = await sql<{ email: string }[]>`
      update subscribers set status = 'unsubscribed'
      where unsub_token = ${token} returning email
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

// ── A/B experiment counters ───────────────────────────────────────────────
let abReady = false;
async function ensureAb() {
  if (!sql || abReady) return;
  await sql`
    create table if not exists ab_stats (
      bucket       text primary key,
      impressions  bigint not null default 0,
      conversions  bigint not null default 0
    )
  `;
  abReady = true;
}

/** +1 impression for an arm (the visitor saw the experiment) */
export async function recordImpression(bucket: string): Promise<void> {
  if (!sql) return;
  try {
    await ensureAb();
    await sql`
      insert into ab_stats (bucket, impressions) values (${bucket}, 1)
      on conflict (bucket) do update set impressions = ab_stats.impressions + 1
    `;
  } catch {
    /* counters are best-effort */
  }
}

/** +1 conversion for an arm (a signup) */
export async function recordConversion(bucket: string): Promise<void> {
  if (!sql) return;
  try {
    await ensureAb();
    await sql`
      insert into ab_stats (bucket, conversions) values (${bucket}, 1)
      on conflict (bucket) do update set conversions = ab_stats.conversions + 1
    `;
  } catch {
    /* counters are best-effort */
  }
}

export type AbRow = {
  bucket: string;
  impressions: number;
  conversions: number; // signups (intent)
  confirmed: number; // double-opt-in confirmed
};

/** per-arm funnel: impressions -> signups -> confirmed */
export async function getAbStats(): Promise<AbRow[]> {
  if (!sql) return [];
  try {
    await ensureAb();
    await ensureSchema();
    const rows = await sql<AbRow[]>`
      select
        s.bucket,
        s.impressions::int as impressions,
        s.conversions::int as conversions,
        coalesce(c.confirmed, 0)::int as confirmed
      from ab_stats s
      left join (
        select ab as bucket, count(*) as confirmed
        from subscribers
        where status = 'confirmed' and ab is not null
        group by ab
      ) c on c.bucket = s.bucket
      order by s.bucket
    `;
    return rows;
  } catch {
    return [];
  }
}
