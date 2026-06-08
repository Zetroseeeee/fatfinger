import { NextResponse } from "next/server";
import { getSubscriberCount } from "@/lib/db";
import { ISSUES } from "@/content/issues";

/**
 * GET /api/stats - real numbers for the hero. Honest by default: with no DB and
 * nothing sent yet, readers = 0 and open rate = 0. `issues` counts the live
 * archive. Cached 60s.
 */
export const revalidate = 60;

export async function GET() {
  const subscribers = await getSubscriberCount(); // 0 until the DB + signups exist
  return NextResponse.json(
    {
      subscribers,
      issues: ISSUES.length, // real: issues in the archive
      openRate: 0, // no email analytics yet → honest 0
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
