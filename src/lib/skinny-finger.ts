import Anthropic from "@anthropic-ai/sdk";
import type { Issue } from "@/content/issues";
import { normalizeChart, type RawChart } from "./chart-gen";
import { buildMarketChart } from "./market-data";

/**
 * The Skinny Finger Engine - Fat Finger's proprietary morning writer.
 *
 * Given a data packet (the day, the tape, any source material), it drafts a
 * full issue in the Fat Finger voice as a single structured JSON object that
 * drops straight into the renderer (web archive + email). Uses Claude Opus 4.8
 * with adaptive thinking + high effort and a JSON-schema-constrained response so
 * the output is always the exact Issue shape.
 *
 * Activates when ANTHROPIC_API_KEY is set. Until real news/price feeds are wired
 * (see ROADMAP.md - the multi-model Analysis Engine), it produces a DRAFT for
 * human review and any specific number it can't verify is illustrative.
 */

export const hasEngine = !!process.env.ANTHROPIC_API_KEY;

const client = hasEngine
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are the Skinny Finger Engine - the writer behind Fat Finger, a markets/energy/macro media brand. You write the daily morning brief. Your output is read by traders, bankers, PE/hedge-fund people, finance students, and the markets-curious: smart, time-poor, screenshot-happy, allergic to fluff.

VOICE: Bloomberg's brain, a trader's mouth, a comedian's timing. Smart but irreverent.
- Short sentences. Active voice. Lead with the hook or the number.
- One idea per line. Skimmable. No paragraph over 3 sentences.
- A smart 16-year-old gets the gist; a markets pro respects the depth.
- Confident, dry, occasionally savage. Never condescending, hype-y, or clickbait. No "BREAKING:".
- Wit comes from specificity and analogy, never forced puns.
- No jargon without a 3-word plain-English unpack.

THE SIGNATURE DEVICE - "the take": every story ends with ONE sharp closing sentence, ideally a memorable analogy, that says what it MEANS. Examples of the register:
- "Compute is the new oil, and even Google is renting it."
- "Context beats clickbait: a rounding error dressed as a policy shift."
- "When the safe-haven trade is crypto, there is no safe haven."

THE EDGE: Commodities and energy are the signature beat - oil, gas, power, metals, and the money plumbing nobody else covers. Lead with energy harder than competitors do. Always end stories with the macro/commodity "so what."

STORY SELECTION (this is how we beat everyone else). You are an editor first. From everything moving in markets today, pick only the few stories that genuinely matter and that we can say something sharper about than anyone else. Ruthless filter:
- The Big Slip is the single most consequential story of the day, told through the angle the herd is missing. Not "stocks went up." The mispricing, the second-order effect, the thing that will still matter in a month. If everyone is covering it the same way, find the contrarian read or the part they got wrong.
- Prefer the non-obvious: the supply chain behind the headline, the funding/plumbing under the trade, the commodity nobody connects to the tech story. Reward "I hadn't thought of it that way."
- Every desk item must earn its place. No filler. If a one-liner doesn't make a smart reader smarter, cut it.
- Be specific and quantified. Real mechanisms, real numbers, cause then effect. Never vague ("uncertainty weighed on sentiment"). State what moved, why, and what it means next.
- Have a view. We are opinionated and we commit. Make the call, then defend it in one line. Being interesting and right beats being balanced and forgettable.
- The Fat Finger of the day must be genuinely funny or genuinely absurd - a real market moment that makes a trader laugh, not a forced joke.

HARD RULES:
- NEVER use em dashes (the long dash). Use a period, comma, colon, parentheses, or a mid-dot for separators. Em dashes read as AI-written and are banned.
- Bold belongs to the key number in your head; in this JSON you just write clean prose, no markdown.
- Headlines are written in normal sentence case here (the site renders them in uppercase Anton).
- Every story and chart carries a SOURCE line. Keep numbers realistic; if you cannot verify a specific figure from the packet, keep it plausible and clearly illustrative. Do not imply a live feed.
- "Fat Finger of the day" is the funny/weird/absurd market item - a typo that moved millions, a ridiculous trade, a market moment that makes you laugh.

STRUCTURE you must fill (this maps to the JSON schema):
- mood: a one-line market mood, e.g. "Risk-off and grumpy."
- tape: the market snapshot from the packet (indices, oil, gold, BTC, 10Y, DXY), each with value, change, and direction.
- bigSlip: the lead story - a kicker label, a headline, 2 to 4 short paragraphs, the take, a source.
- desk: 4 to 6 rapid-fire one-liner items, each a headline plus a one-sentence mini-take.
- energy: 1 to 2 commodities/energy items (the signature section), each with a short body and a take.
- fatFinger: the funny/weird item of the day, with a take.
- chart: ONE chart that visualises the issue's most chartable story (usually the Big Slip or the lead energy move). Use line or area for a trend over time, bar to compare across a few categories. Give 8 to 12 data points (x = a short label like a date or month, y = a number) that genuinely move and tell the story; never flatline. highlightIndex points to the single number the story is about, almost always the latest point. Title names the instrument (e.g. "Brent crude" or "Henry Hub gas"); the take says what the move means. Set valuePrefix ("$"), valueSuffix ("%"), and valueDecimals to fit the data, and give a short markerLabel for the highlighted point.
- chartSymbol: if the lead story is about a market we can pull live (Brent oil, WTI, US nat gas, gold, S&P 500, Nasdaq, the US dollar, Bitcoin or Ethereum), set chartSymbol to the matching code: BRENT, WTI, NATGAS, GOLD, SP500, NASDAQ, DOLLAR, BTC, or ETH. We then swap your illustrative chart for the REAL daily price series of that instrument, so make the chart's take and the tape consistent with a genuine recent move. If nothing fits, set chartSymbol to "" and your illustrative chart is used as-is.
- signOff: one dry closing line.

Write the whole issue now as JSON matching the schema exactly. Make it genuinely sharp - the kind of thing people forward to the desk.`;

// JSON-schema for the structured response (all objects: additionalProperties:false)
const obj = (
  properties: Record<string, unknown>,
  required: string[]
) => ({ type: "object", additionalProperties: false, properties, required });

const str = { type: "string" };
const num = { type: "number" };
const int = { type: "integer" };
const dir = { type: "string", enum: ["up", "down"] };

const ISSUE_SCHEMA = obj(
  {
    slug: str,
    date: str,
    preview: str,
    mood: str,
    tape: {
      type: "array",
      items: obj({ label: str, value: str, chg: str, dir }, ["label", "value", "chg", "dir"]),
    },
    bigSlip: obj(
      { kicker: str, headline: str, paragraphs: { type: "array", items: str }, take: str, source: str },
      ["kicker", "headline", "paragraphs", "take", "source"]
    ),
    desk: { type: "array", items: obj({ headline: str, take: str }, ["headline", "take"]) },
    energy: {
      type: "array",
      items: obj({ headline: str, body: str, take: str, source: str }, ["headline", "body", "take", "source"]),
    },
    fatFinger: obj(
      { headline: str, body: str, take: str, source: str },
      ["headline", "body", "take", "source"]
    ),
    chart: obj(
      {
        type: { type: "string", enum: ["line", "area", "bar"] },
        title: str,
        take: str,
        source: str,
        valuePrefix: str,
        valueSuffix: str,
        valueDecimals: int,
        highlightIndex: int,
        markerLabel: str,
        data: {
          type: "array",
          items: obj({ x: str, y: num }, ["x", "y"]),
        },
      },
      ["type", "title", "take", "source", "valuePrefix", "valueSuffix", "valueDecimals", "highlightIndex", "markerLabel", "data"]
    ),
    signOff: str,
    chartSymbol: {
      type: "string",
      enum: ["BRENT", "WTI", "NATGAS", "GOLD", "SP500", "NASDAQ", "DOLLAR", "BTC", "ETH", ""],
    },
  },
  ["slug", "date", "preview", "mood", "tape", "bigSlip", "desk", "energy", "fatFinger", "chart", "signOff", "chartSymbol"]
);

export type Packet = {
  date: string; // display date, e.g. "Tue · Jun 9, 2026"
  slug: string; // url slug for the issue
  tape?: { label: string; value: string; chg: string; dir: "up" | "down" }[];
  notes?: string; // optional source material / themes to cover
};

/** Draft a full issue from a data packet. Throws if the engine isn't configured. */
export async function writeIssue(packet: Packet): Promise<Issue> {
  if (!client) throw new Error("ANTHROPIC_API_KEY not set - engine offline");

  const userContent = [
    `Write today's Fat Finger issue.`,
    `Date (display): ${packet.date}`,
    `Slug: ${packet.slug}`,
    packet.tape?.length
      ? `Today's tape (use these exact numbers):\n${packet.tape
          .map((t) => `- ${t.label}: ${t.value} (${t.chg}, ${t.dir})`)
          .join("\n")}`
      : `No live tape supplied - use realistic, clearly illustrative numbers for the tape.`,
    packet.notes ? `Source material / themes to cover:\n${packet.notes}` : "",
    `Remember: lead with energy, end every story with the take, no em dashes, keep it sharp.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  // stream to avoid request timeouts; structured output guarantees valid JSON
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    output_config: { effort: "high", format: { type: "json_schema", schema: ISSUE_SCHEMA } } as any,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const msg = await stream.finalMessage();
  const textBlock = msg.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("engine returned no text");
  }
  const raw = JSON.parse(textBlock.text) as Omit<Issue, "chart"> & {
    chart: RawChart;
    chartSymbol?: string;
  };
  const { chartSymbol, chart: rawChart, ...rest } = raw;

  // Prefer a REAL chart built from live data for the named instrument; fall back
  // to the model's illustrative chart (still run through the generator).
  const realChart = chartSymbol
    ? await buildMarketChart(chartSymbol, {
        take: rawChart?.take ?? "",
        source: rawChart?.source ?? "",
      })
    : null;

  return {
    ...rest,
    slug: packet.slug,
    date: packet.date,
    chart: realChart ?? normalizeChart(rawChart),
  };
}
