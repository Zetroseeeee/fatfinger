"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "ab" | "out">("");

  async function resetAb() {
    if (
      !confirm(
        "Re-open the A/B test? This clears the current winner and goes back to a 50/50 split."
      )
    )
      return;
    setBusy("ab");
    await fetch("/api/admin/ab-reset", { method: "POST" });
    setBusy("");
    router.refresh();
  }

  async function logout() {
    setBusy("out");
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={resetAb}
        disabled={busy !== ""}
        className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy === "ab" ? "…" : "↻ Re-open A/B test"}
      </button>
      <button
        onClick={logout}
        disabled={busy !== ""}
        className="rounded-full border-2 border-ink/30 px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
      >
        Log out
      </button>
    </div>
  );
}
