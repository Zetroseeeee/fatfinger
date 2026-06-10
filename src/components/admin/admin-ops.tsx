"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = { tone: "ok" | "err" | "info"; text: string } | null;

export function AdminOps() {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState<Result>(null);

  async function run(key: string, fn: () => Promise<Result>) {
    setBusy(key);
    setResult({ tone: "info", text: "Working… (the writer can take up to a minute)" });
    try {
      setResult(await fn());
    } catch {
      setResult({ tone: "err", text: "Something went wrong." });
    }
    setBusy("");
    router.refresh();
  }

  const writer = () =>
    run("writer", async () => {
      const r = await fetch("/api/admin/run-writer", { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (!d.ok)
        return {
          tone: "err",
          text:
            d.error === "write_failed"
              ? "Writer failed — most likely the Anthropic account needs credits."
              : `Writer error: ${d.error ?? r.status}`,
        };
      return {
        tone: "ok",
        text: `Published “${d.headline ?? d.slug}”${d.sent ? `, emailed ${d.sent} subscriber(s)` : ""}.`,
      };
    });

  const optimizer = () =>
    run("opt", async () => {
      const r = await fetch("/api/admin/run-optimizer", { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (!d.ok) return { tone: "err", text: `Optimizer error: ${d.error ?? r.status}` };
      if (d.status === "already_decided")
        return { tone: "ok", text: `Already decided — arm ${String(d.winner).toUpperCase()} is live.` };
      return {
        tone: "ok",
        text: d.winner
          ? `Winner found: arm ${String(d.winner).toUpperCase()} is now live.`
          : `Still testing — ${d.reason ?? "not significant yet"}.`,
      };
    });

  const reopen = () => {
    if (!confirm("Re-open the A/B test? This clears the current winner and goes back to 50/50."))
      return;
    run("ab", async () => {
      await fetch("/api/admin/ab-reset", { method: "POST" });
      return { tone: "ok", text: "A/B test re-opened (50/50 split)." };
    });
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const base =
    "rounded-full border-2 px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5 disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button onClick={writer} disabled={busy !== ""} className={`${base} border-ink bg-signal text-paper`}>
          {busy === "writer" ? "…" : "▶ Write today's issue"}
        </button>
        <button onClick={optimizer} disabled={busy !== ""} className={`${base} border-ink bg-paper text-ink`}>
          {busy === "opt" ? "…" : "↻ Run A/B optimizer"}
        </button>
        <button onClick={reopen} disabled={busy !== ""} className={`${base} border-ink bg-paper text-ink`}>
          {busy === "ab" ? "…" : "⟲ Re-open A/B test"}
        </button>
        <a href="/api/admin/export" className={`${base} border-ink bg-paper text-ink`}>
          ⤓ Export CSV
        </a>
        <button onClick={logout} disabled={busy !== ""} className={`${base} border-ink/30 text-ink-soft hover:text-ink`}>
          Log out
        </button>
      </div>
      {result ? (
        <p
          className={`mt-3 font-mono text-[12px] ${
            result.tone === "ok" ? "text-up" : result.tone === "err" ? "text-signal" : "text-ink-soft"
          }`}
        >
          {result.text}
        </p>
      ) : null}
    </div>
  );
}
