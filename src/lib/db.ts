import postgres from "postgres";

/**
 * Postgres access (Supabase or Neon) via DATABASE_URL. Everything degrades
 * gracefully when DATABASE_URL is unset: `sql` is null, helpers return safe
 * defaults, and the app keeps working (the funnel just doesn't persist yet).
 *
 * For Vercel serverless + Supabase, use the TRANSACTION pooler URL (port 6543);
 * `prepare: false` is required for pgbouncer. SSL comes from the URL's sslmode.
 */
const url = process.env.DATABASE_URL;

// module-level singleton, reused across warm serverless invocations
export const sql = url
  ? postgres(url, { prepare: false, idle_timeout: 20, max: 3 })
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
  token: string
): Promise<{ created: boolean } | null> {
  if (!sql) return null;
  await ensureSchema();
  const rows = await sql<{ created: boolean }[]>`
    insert into subscribers (email, status, token)
    values (${email}, 'pending', ${token})
    on conflict (email) do update
      set token = case
        when subscribers.status = 'pending' then ${token}
        else subscribers.token end
    returning (xmax = 0) as created
  `;
  return { created: rows[0]?.created ?? false };
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
      status      text not null default 'draft', -- draft | published
      created_at  timestamptz not null default now()
    )
  `;
  draftsReady = true;
}

/** persist an engine-written issue draft (idempotent on slug); no-op without DB */
export async function saveGeneratedIssue(
  slug: string,
  date: string,
  data: unknown
): Promise<boolean> {
  if (!sql) return false;
  try {
    await ensureDrafts();
    await sql`
      insert into generated_issues (slug, date, data)
      values (${slug}, ${date}, ${JSON.stringify(data)}::jsonb)
      on conflict (slug) do update set data = excluded.data, date = excluded.date
    `;
    return true;
  } catch {
    return false;
  }
}
