"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Listen" button. Tries the premium human voice (/api/tts/[slug], ElevenLabs)
 * first; if that isn't configured it falls back to the browser's built-in voice
 * so the feature always works. The button doubles as Stop while playing.
 */
export function ListenButton({
  slug,
  narration,
}: {
  slug: string;
  narration: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  function cleanup() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }

  useEffect(() => cleanup, []);

  function stop() {
    cleanup();
    setState("idle");
  }

  async function play() {
    setState("loading");
    // 1) premium voice
    try {
      const res = await fetch(`/api/tts/${slug}`);
      const type = res.headers.get("content-type") || "";
      if (res.ok && type.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = stop;
        await a.play();
        setState("playing");
        return;
      }
    } catch {
      /* fall through to the browser voice */
    }
    // 2) browser voice
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(narration);
      u.rate = 1;
      u.onend = stop;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setState("playing");
      return;
    }
    setState("idle");
  }

  const playing = state === "playing";
  const loading = state === "loading";
  return (
    <button
      onClick={playing || loading ? stop : play}
      aria-label={playing ? "Stop narration" : "Listen to this issue"}
      className="flex items-center gap-2 rounded-full border-2 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors"
      style={{
        borderColor: "var(--rd-line)",
        background: "var(--rd-bg)",
        color: "var(--rd-text)",
      }}
    >
      <span style={{ color: "#e5342b" }}>
        {loading ? "•••" : playing ? "■" : "▶"}
      </span>
      {loading ? "Loading" : playing ? "Stop" : "Listen"}
    </button>
  );
}
