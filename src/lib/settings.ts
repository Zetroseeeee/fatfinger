import { sql } from "@/lib/db";
import { settingDefaults } from "@/lib/settings-config";

/**
 * Key/value settings store. Admin reads/writes go straight to the DB; public
 * pages use getSettingsCached() which never blocks on the database (returns
 * cached values or defaults instantly, refreshes in the background) - same
 * pattern as the A/B decision cache, so settings can't slow the site down.
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

/** full settings map (defaults overlaid with stored values) - admin use */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const base = settingDefaults();
  if (!sql) return base;
  try {
    await ensure();
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
      await sql`
        insert into app_settings (key, value) values (${k}, ${JSON.stringify(v)}::jsonb)
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `;
    }
    settingsCache = { at: 0, map: {} }; // bust
  } catch {
    /* best-effort */
  }
}

// ── Non-blocking cache for public pages ───────────────────────────────────
let settingsCache: { at: number; map: Record<string, unknown> } = { at: 0, map: {} };
let inflight = false;

export async function getSettingsCached(): Promise<Record<string, unknown>> {
  const now = Date.now();
  const fresh = now - settingsCache.at < 300_000 && Object.keys(settingsCache.map).length > 0;
  if (!fresh && !inflight && sql) {
    inflight = true;
    getAllSettings()
      .then((m) => {
        settingsCache = { at: Date.now(), map: m };
      })
      .catch(() => {})
      .finally(() => {
        inflight = false;
      });
  }
  return Object.keys(settingsCache.map).length ? settingsCache.map : settingDefaults();
}

/** convenience: one cached setting with a typed fallback (never blocks) */
export async function setting<T>(key: string, fallback: T): Promise<T> {
  const all = await getSettingsCached();
  return (all[key] as T) ?? fallback;
}
