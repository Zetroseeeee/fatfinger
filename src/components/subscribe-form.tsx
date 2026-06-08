"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SubscribeForm - the one real signup form, shared by the homepage newsletter
 * section and the /subscribe page. POSTs to /api/subscribe (Resend + DB seam),
 * honeypot + accurate success/error messaging.
 */
export function SubscribeForm({
  buttonLabel = "Subscribe",
  className = "",
}: {
  buttonLabel?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "That email doesn't look right. Try again."
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("That email doesn't look right. Try again.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(
          data?.error === "invalid_email"
            ? "That email doesn't look right. Try again."
            : "Something went wrong on our end. Try again."
        );
        setStatus("error");
        return;
      }
      setPendingConfirmation(Boolean(data?.pendingConfirmation));
      setWebsite("");
      setStatus("success");
    } catch {
      setErrorMessage("Couldn't reach the desk. Check your connection.");
      setStatus("error");
    }
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ink bg-paper p-6 shadow-hard-sm"
          >
            <span className="font-display text-2xl text-ink">
              You&apos;re on the desk<span className="text-signal">.</span>
            </span>
            <span className="font-mono text-[12px] text-ink-soft">
              {pendingConfirmation
                ? "Check your inbox to confirm. First brief lands at 6:30 AM ET."
                : "You're on the list. First brief lands at 6:30 AM ET."}
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              aria-hidden
            />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="you@desk.com"
              className="h-12 flex-1 rounded-full border-2 border-ink bg-paper px-5 font-mono text-[13px] text-ink placeholder:text-ink-soft/60 outline-none transition-shadow focus:shadow-hard-sm"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-busy={status === "loading"}
              className="h-12 shrink-0 rounded-full border-2 border-ink bg-signal px-7 font-mono text-[12px] uppercase tracking-[0.16em] text-paper transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
            >
              {status === "loading" ? "…" : buttonLabel}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {status === "error" && (
        <p role="alert" className="mt-3 font-mono text-[12px] text-signal">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
