"use client";

import { useEffect } from "react";

/**
 * Fires one A/B impression per browser session (sessionStorage-guarded) so we
 * can measure signup RATE per arm, not just raw signups. The arm is decided at
 * the edge and passed in from the server, so there's no flash or double-count.
 */
export function AbBeacon({ bucket }: { bucket: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ff_ab_seen")) return;
      sessionStorage.setItem("ff_ab_seen", "1");
    } catch {
      // private mode / no storage - just skip the dedupe
    }
    fetch("/api/ab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket }),
      keepalive: true,
    }).catch(() => {});
  }, [bucket]);

  return null;
}
