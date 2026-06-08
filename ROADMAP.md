# Fat Finger - Roadmap & North Star

The site, the live ticker, the newsletter pipeline and the paid tiers are the
foundation. The **moat** is the next phase: being demonstrably one of the best
markets-analysis sources on the internet, by aggregating the best AI + human
analysis and rendering it better than anyone. This doc is the plan for that.
It needs real API keys + budget, so we build it deliberately, in phases.

## North Star

> Fat Finger doesn't just have an opinion. It runs the question past every good
> analyst (model + data source) there is, aggregates the signal, kills the noise,
> and lays the answer out so cleanly a 16-year-old gets the gist and a PM respects
> the depth - with hedge-fund-grade charts to match.

Two engines make that real: the **Analysis Engine** and the **ChartGenerator**.

## 1. The Analysis Engine (multi-AI aggregation)

A pipeline that, per story/ticker/question, fans out to many analysts and
synthesizes one editor-grade answer.

**Sources to aggregate (the more, the better):**
- LLM analysts, in parallel: Claude (Anthropic), GPT (OpenAI), Gemini (Google),
  Grok, Llama, DeepSeek, plus finance-tuned models. Each gets the same packet
  (price action, filings, transcripts, news) and a strict rubric.
- Market data: prices/fundamentals/technicals (Twelve Data, Polygon, FMP,
  AlphaVantage), filings (SEC EDGAR), transcripts, economic calendars.
- Sell-side/news/sentiment feeds where licensable.

**Pipeline (fan-out -> verify -> synthesize), mirrors our Workflow pattern:**
1. **Gather** the data packet for the subject.
2. **Fan out**: each model produces a structured take (thesis, evidence,
   bull/bear, catalysts, confidence) against a fixed schema.
3. **Adversarial verify**: a second pass where models try to *refute* each
   finding; claims that survive a majority survive. Kills hallucinations.
4. **Aggregate**: weight by track record + agreement; surface consensus AND the
   sharpest dissent (the dissent is often the alpha).
5. **Editor layer**: render in Fat Finger voice - lead with the number, end with
   the take, every claim sourced. Never "done-before" boilerplate.
6. **Output**: the newsletter item + the web story + the chart spec, all from one
   structured result (one source of truth, like our issues today).

**Guardrails:** every claim carries its sources; confidence is shown, not hidden;
"Not investment advice." stays. Provenance is a feature, not fine print.

## 2. FatFingerChartGenerator (hedge-fund-grade charts)

Today `FatFingerChart` is the themed Recharts wrapper (one red highlight, mono
axes, a take, a source). The generator is the next layer: from a ticker + a
question, it *generates the right chart and the analysis on it* - not a template.

**Capabilities to build:**
- **Technicals:** moving averages (SMA/EMA), VWAP, Bollinger, RSI/MACD panels,
  volume, support/resistance + trendlines, drawdown, relative strength.
- **Fundamentals overlays:** earnings/revenue, multiples vs history, margins,
  guidance vs consensus - the *why* under the price.
- **Annotation engine:** the red marker + label on the ONE thing that matters,
  auto-placed; event flags (OPEC, CPI, earnings) on the timeline.
- **Composition:** the Analysis Engine picks chart *type + framing + the single
  point to highlight*; the generator renders it in the dark terminal house style.
- **Real data** at publish time (not illustrative), cached + sourced.

The bar: a reader screenshots it and it looks like it came off a real desk.

## Phasing

- **P0 (done):** site, live ticker, newsletter template + sample issues, subscribe
  + double opt-in (Resend/Supabase seam), paid-tier page, mobile.
- **P1:** Analysis Engine v1 - 2-3 models fan-out + verify + editor layer on a
  cron, producing one real issue/day from live data. Human-in-the-loop review.
- **P2:** FatFingerChartGenerator v1 - technicals + auto-annotation on real data,
  wired into issues.
- **P3:** widen the model/source panel, add track-record weighting, fundamentals
  overlays, and the premium quant tier (the £19.99/£49.99 desks) gets the deep
  engine output.

## What it needs

Model API keys (Anthropic/OpenAI/Google/…), market-data + filings keys, a job
runner (cron/queue on Vercel), and a budget per issue. All have clean seams in
the current codebase (route handlers, `src/content`, `src/lib`). We turn it on
key by key, same as the live ticker and email.
