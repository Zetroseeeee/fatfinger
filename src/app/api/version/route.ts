import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/** Ground truth: which build is serving, and can it reach the database? */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const out: Record<string, unknown> = {
    sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    region: process.env.VERCEL_REGION ?? "dev",
    at: new Date().toISOString(),
  };
  if (new URL(req.url).searchParams.get("db") === "1" && sql) {
    const t0 = Date.now();
    try {
      const r = await sql`select 1 as ok`;
      out.db = { ok: r[0]?.ok === 1, ms: Date.now() - t0 };
    } catch (e) {
      out.db = { ok: false, ms: Date.now() - t0, err: (e as Error).message.slice(0, 80) };
    }
  }
  return NextResponse.json(out);
}
