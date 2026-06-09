"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) router.replace("/admin");
    else setErr(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="font-body text-2xl font-bold lowercase tracking-[-0.03em]">
          fatfinger<span className="text-signal">.</span>
        </div>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          Mission control
        </p>
        <h1 className="mt-6 font-display text-3xl uppercase leading-none">
          Admin login
        </h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            if (err) setErr(false);
          }}
          placeholder="Password"
          autoFocus
          className="mt-6 h-12 w-full rounded-full border-2 border-ink bg-paper px-5 font-mono text-[13px] outline-none focus:shadow-hard-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 h-12 w-full rounded-full border-2 border-ink bg-signal font-mono text-[12px] uppercase tracking-[0.16em] text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-70"
        >
          {loading ? "…" : "Enter"}
        </button>
        {err ? (
          <p role="alert" className="mt-3 font-mono text-[12px] text-signal">
            Wrong password. (Set ADMIN_PASSWORD in your env if you haven&apos;t.)
          </p>
        ) : null}
      </form>
    </main>
  );
}
