"use client";

import { useEffect } from "react";

/**
 * First-touch attribution. On the visitor's first landing, capture the UTM tags
 * and referrer into the `ff_src` cookie (90 days, first-touch only). The signup
 * route reads it and attaches it to the subscriber, so we can see which channel
 * / campaign / ad actually drives subscribers (see /ab). Privacy-light: just the
 * marketing source, no PII.
 */
export function Attribution() {
  useEffect(() => {
    try {
      if (document.cookie.includes("ff_src=")) return; // first touch wins
      const q = new URLSearchParams(window.location.search);
      const ref = document.referrer || "";
      let refHost = "";
      try {
        refHost = ref ? new URL(ref).hostname.replace(/^www\./, "") : "";
      } catch {
        /* ignore malformed referrer */
      }
      const self = window.location.hostname.replace(/^www\./, "");
      const data = {
        source:
          q.get("utm_source") ||
          (refHost && refHost !== self ? refHost : "") ||
          "direct",
        medium: q.get("utm_medium") || (q.get("utm_source") ? "" : refHost ? "referral" : "none"),
        campaign: q.get("utm_campaign") || "",
        content: q.get("utm_content") || "",
        term: q.get("utm_term") || "",
        ref: refHost,
      };
      document.cookie = `ff_src=${encodeURIComponent(
        JSON.stringify(data)
      )}; max-age=${60 * 60 * 24 * 90}; path=/; samesite=lax`;
    } catch {
      /* attribution is best-effort */
    }
  }, []);

  return null;
}
