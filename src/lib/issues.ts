import { ISSUES, getIssue as getStaticIssue, type Issue } from "@/content/issues";
import { getPublishedIssues, getPublishedIssue } from "@/lib/db";
import { setting } from "@/lib/settings";

/**
 * The live archive: AI-published issues (newest first), then the static sample
 * issues unless they've been switched off in Settings → Site.
 */
export async function getAllIssues(): Promise<Issue[]> {
  const published = await getPublishedIssues();
  const showSamples = await setting("showSampleIssues", true);
  if (!showSamples) return published;
  const seen = new Set(published.map((i) => i.slug));
  return [...published, ...ISSUES.filter((i) => !seen.has(i.slug))];
}

/** Resolve one issue by slug: live published first, then a static sample. */
export async function resolveIssue(slug: string): Promise<Issue | null> {
  return (await getPublishedIssue(slug)) ?? getStaticIssue(slug) ?? null;
}
