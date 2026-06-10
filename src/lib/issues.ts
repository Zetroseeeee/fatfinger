import { cache } from "react";
import { ISSUES, getIssue as getStaticIssue, type Issue } from "@/content/issues";
import { getPublishedIssues } from "@/lib/db";
import { setting } from "@/lib/settings";

/**
 * The live archive: AI-published issues (newest first), then the static sample
 * issues unless they've been switched off in Settings → Site.
 *
 * Wrapped in React cache() so generateMetadata and the page component share ONE
 * DB query per request instead of firing concurrent ones (concurrent queries on
 * the pooled connection stall against Supabase's transaction pooler).
 */
export const getAllIssues = cache(async (): Promise<Issue[]> => {
  const published = await getPublishedIssues();
  const showSamples = await setting("showSampleIssues", true);
  if (!showSamples) return published;
  const seen = new Set(published.map((i) => i.slug));
  return [...published, ...ISSUES.filter((i) => !seen.has(i.slug))];
});

/** Resolve one issue by slug from the same per-request archive read. */
export async function resolveIssue(slug: string): Promise<Issue | null> {
  const all = await getAllIssues();
  return all.find((i) => i.slug === slug) ?? getStaticIssue(slug) ?? null;
}
