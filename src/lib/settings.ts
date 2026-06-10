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
const TTL_MS = 20_000;
let settingsCache: { at: number; map: Record<string, unknown> } | null = null;

export async function getSettingsCached(): Promise<Record<string, unknown>> {
  const now = Date.now();
  if (settingsCache && now - settingsCache.at < TTL_MS) return settingsCache.map;
  // miss: read the DB, but bounded so a slow connection can't hang the page
  const fallback = settingsCache?.map ?? settingDefaults();
  try {
    const map = await Promise.race([
      getAllSettings(),
      new Promise<Record<string, unknown>>((res) => setTimeout(() => res(fallback), 3000)),
    ]);
    settingsCache = { at: now, map };
    return map;
  } catch {
    return fallback;
  }
}

/** convenience: one cached setting with a typed fallback */
export async function setting<T>(key: string, fallback: T): Promise<T> {
  const all = await getSettingsCached();
  return (all[key] as T) ?? fallback;
}
