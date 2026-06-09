import { ISSUES, getIssue as getStaticIssue, type Issue } from "@/content/issues";
import { getPublishedIssues, getPublishedIssue } from "@/lib/db";

/**
 * The live archive: AI-published issues (newest first) followed by the static
 * sample issues. So the daily engine output appears on /issues automatically,
 * with the hand-written samples as a backstop while the list is young.
 */
export async function getAllIssues(): Promise<Issue[]> {
  const published = await getPublishedIssues();
  const seen = new Set(published.map((i) => i.slug));
  return [...published, ...ISSUES.filter((i) => !seen.has(i.slug))];
}

/** Resolve one issue by slug: live published first, then a static sample. */
export async function resolveIssue(slug: string): Promise<Issue | null> {
  return (await getPublishedIssue(slug)) ?? getStaticIssue(slug) ?? null;
}
