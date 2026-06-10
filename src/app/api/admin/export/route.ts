import { isAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Admin-only: download all subscribers as CSV. */
export async function GET() {
  if (!(await isAdmin())) return new Response("unauthorized", { status: 401 });
  if (!sql) return new Response("no database", { status: 500 });
  try {
    const rows = await sql<
      { email: string; status: string; tier: string; source: string; created_at: string }[]
    >`
      select email, status, tier,
        coalesce(nullif(src->>'source', ''), 'direct') as source,
        created_at::text as created_at
      from subscribers order by created_at desc
    `;
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      "email,status,tier,source,created_at",
      ...rows.map((r) => [r.email, r.status, r.tier, r.source, r.created_at].map(esc).join(",")),
    ].join("\n");
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=fatfinger-subscribers.csv",
      },
    });
  } catch {
    return new Response("export failed", { status: 500 });
  }
}
