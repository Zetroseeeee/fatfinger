"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SETTINGS, type Field } from "@/lib/settings-config";

function Live() {
  return (
    <span className="ml-2 rounded-full bg-up/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-up">
      Live
    </span>
  );
}

function FieldRow({
  f,
  value,
  onChange,
}: {
  f: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (f.type === "toggle") {
    const on = !!value;
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="min-w-0">
          <div className="text-sm text-ink">
            {f.label}
            {f.wired ? <Live /> : null}
          </div>
          {f.help ? <div className="text-[12px] leading-snug text-ink-soft">{f.help}</div> : null}
        </div>
        <button
          type="button"
          onClick={() => onChange(!on)}
          aria-pressed={on}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${on ? "bg-up" : "bg-ink/25"}`}
        >
          <span
            className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>
    );
  }

  return (
    <label className="block py-1">
      <div className="text-sm text-ink">
        {f.label}
        {f.wired ? <Live /> : null}
      </div>
      {f.help ? <div className="text-[12px] leading-snug text-ink-soft">{f.help}</div> : null}
      {f.type === "select" ? (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3 py-2 font-mono text-[13px]"
        >
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={f.type === "number" ? "number" : "text"}
          value={value == null ? "" : String(value)}
          onChange={(e) =>
            onChange(f.type === "number" ? Number(e.target.value) : e.target.value)
          }
          className="mt-1.5 w-full rounded-lg border-2 border-ink bg-paper px-3 py-2 font-mono text-[13px]"
        />
      )}
    </label>
  );
}

export function AdminSettings({ values }: { values: Record<string, unknown> }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, unknown>>(values);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: string, v: unknown) {
    setVals((p) => ({ ...p, [key]: v }));
    setDirty(true);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vals),
    });
    setSaving(false);
    setDirty(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        {SETTINGS.map((g) => (
          <div key={g.id} className="rounded-2xl border-2 border-ink bg-paper p-5">
            <h3 className="font-display text-xl uppercase leading-none text-ink">{g.title}</h3>
            <p className="mt-1 text-[13px] text-ink-soft">{g.blurb}</p>
            <div className="mt-4 divide-y divide-ink/10">
              {g.fields.map((f) => (
                <FieldRow key={f.key} f={f} value={vals[f.key]} onChange={(v) => set(f.key, v)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 z-10 mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-full border-2 border-ink bg-signal px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-paper shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved ? (
          <span className="font-mono text-[12px] text-up">Saved.</span>
        ) : dirty ? (
          <span className="font-mono text-[12px] text-ink-soft">Unsaved changes</span>
        ) : null}
      </div>
    </div>
  );
}
