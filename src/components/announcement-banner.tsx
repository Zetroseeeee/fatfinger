import { getSettingsCached } from "@/lib/settings";

/** Sitewide announcement bar, controlled from /admin → Settings → Site. */
export async function AnnouncementBanner() {
  const s = await getSettingsCached();
  if (!s.announcementOn || !s.announcementText) return null;
  return (
    <div className="bg-signal px-4 py-2 text-center font-mono text-[12px] uppercase tracking-[0.1em] text-paper">
      {String(s.announcementText)}
    </div>
  );
}
