import { headers } from "next/headers";
import { getSettingsCached } from "@/lib/settings";

/** When maintenance mode is on, every public page shows a holding page; /admin
 * stays reachable so you can switch it back off. */
export async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const s = await getSettingsCached();
  if (!s.maintenanceMode) return <>{children}</>;
  const path = (await headers()).get("x-ff-path") || "";
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="font-body text-3xl font-bold lowercase tracking-[-0.03em]">
        fatfinger<span className="text-signal">.</span>
      </div>
      <h1 className="mt-6 font-display text-[clamp(2.5rem,8vw,5rem)] uppercase leading-[0.9]">
        Back in a minute.
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        We&apos;re tuning the desk. The brief will be right back.
      </p>
    </main>
  );
}

const ACCENTS: Record<string, string> = {
  "signal red": "#e5342b",
  electric: "#3d5aff",
  green: "#0f9d63",
};

/** Override the brand accent colour sitewide from Settings → Appearance. */
export async function AccentStyle() {
  const s = await getSettingsCached();
  const hex = ACCENTS[String(s.accent ?? "")];
  if (!hex || hex === "#e5342b") return null; // default, nothing to override
  return <style>{`:root{--color-signal:${hex};}`}</style>;
}

/** Build/region chip, bottom-left (Settings → Advanced → debug banner). */
export async function DebugBanner() {
  const s = await getSettingsCached();
  if (!s.debugBanner) return null;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
  const region = process.env.VERCEL_REGION ?? "dev";
  return (
    <div className="fixed bottom-2 left-2 z-[100] rounded-md bg-ink/90 px-2.5 py-1 font-mono text-[10px] tracking-wide text-paper/80">
      debug · {sha} · {region}
    </div>
  );
}
