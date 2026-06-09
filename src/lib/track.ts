/**
 * Fire the "signup" conversion across whichever ad pixels are live. Called by
 * the subscribe forms on a successful submit. Safe no-op if a pixel isn't loaded.
 */
type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;
type Ttq = { track: (...args: unknown[]) => void };

export function trackSignup() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: Fbq; gtag?: Gtag; ttq?: Ttq };
  try {
    w.fbq?.("track", "Lead");
  } catch {}
  try {
    w.gtag?.("event", "sign_up", { method: "newsletter" });
  } catch {}
  try {
    w.ttq?.track("CompleteRegistration");
  } catch {}
}
