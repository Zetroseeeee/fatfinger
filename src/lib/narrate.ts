import type { Issue } from "@/content/issues";

/** Turn an issue into a natural spoken script (for TTS / the listen button). */
export function narrate(issue: Issue): string {
  return [
    `Fat Finger. ${issue.date.replace(/\s*·\s*/g, ", ")}.`,
    issue.preview,
    `The big slip. ${issue.bigSlip.headline}.`,
    ...issue.bigSlip.paragraphs,
    `The take. ${issue.bigSlip.take}`,
    "On the desk.",
    ...issue.desk.map((d) => `${d.headline} ${d.take}`),
    "The energy desk.",
    ...issue.energy.map((e) => `${e.headline}. ${e.body} ${e.take}`),
    `And the fat finger of the day. ${issue.fatFinger.headline}. ${issue.fatFinger.body} ${issue.fatFinger.take}`,
    issue.signOff,
  ].join("\n\n");
}
