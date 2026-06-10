import { sql } from "@/lib/db";
import { settingDefaults } from "@/lib/settings-config";

/**
 * Key/value settings store. Admin reads/writes go straight to the DB; public
 * pages use getSettingsCached() - a short TTL cache that reads the DB on a miss
 * (bounded so it can't hang) and serves from memory otherwise. A saved setting
 * shows up on the live site within ~TTL seconds.
 */
let ready = false;
let readyP: Promise<void> | null = null;
async function ensure() {
  if (!sql || ready) return;
  const db = sql;
  readyP ??= (async () => {
    await db`
      create table if not exists app_settings (
        key        text primary key,
        value      jsonb not null,
        updated_at timestamptz not null default now()
      )
    `;
    ready = true;
  })();
  await readyP;
}

/** full settings map (defaults overlaid with stored values) - admin use.
 * No DDL here: the table is created by setSettings; if it doesn't exist yet the
 * select throws and we fall back to defaults. */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const base = settingDefaults();
  if (!sql) return base;
  try {
    const rows = await sql<{ key: string; value: unknown }[]>`select key, value from app_settings`;
    for (const r of rows) base[r.key] = r.value;
    return base;
  } catch {
    return base;
  }
}

export async function setSettings(patch: Record<string, unknown>): Promise<void> {
  if (!sql) return;
  try {
    await ensure();
    for (const [k, v] of Object.entries(patch)) {
      // sql.json() encodes the value ONCE for the jsonb column (manual
      // JSON.stringify + ::jsonb double-encoded it). null is stored as JSON null.
      const json = sql.json((v ?? null) as Parameters<typeof sql.json>[0]);
      await sql`
        insert into app_settings (key, value) values (${k}, ${json})
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `;
    }
    settingsCache = null; // local bust (other instances expire via TTL)
  } catch {
    /* best-effort */
  }
}

// ── Short TTL cache for public pages ──────────────────────────────────────
// The TTL itself is a setting (Advanced → cacheTtl, seconds, clamped 5-600):
// lower = changes propagate faster, higher = fewer DB reads.
let settingsCache: { at: number; map: Record<string, unknown> } | null = null;

function ttlMs(): number {
  const v = Number(settingsCache?.map?.cacheTtl);
  if (!Number.isFinite(v) || v <= 0) return 20_000;
  return Math.min(600, Math.max(5, v)) * 1000;
}

let settingsInflight: Promise<void> | null = null;

export async function getSettingsCached(): Promise<Record<string, unknown>> {
  const now = Date.now();
  if (!settingsCache || now - settingsCache.at >= ttlMs()) {
    // refresh in the background, deduped across concurrent callers. NEVER
    // block a page render on this query and NEVER Promise.race/abandon it:
    // settings reads run concurrently with page queries, and anything that
    // waits on (or poisons) the pooled connection hangs whole routes.
    // A cold instance serves defaults for its very first render, then is warm.
    settingsInflight ??= getAllSettings()
      .then((map) => {
        settingsCache = { at: Date.now(), map };
      })
      .catch(() => {})
      .finally(() => {
        settingsInflight = null;
      });
  }
  return settingsCache?.map ?? settingDefaults();
}

/** convenience: one cached setting with a typed fallback */
export async function setting<T>(key: string, fallback: T): Promise<T> {
  const all = await getSettingsCached();
  return (all[key] as T) ?? fallback;
}
