import { Resend } from "resend";
import type { Issue } from "@/content/issues";
import { getConfirmedRecipients } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";

/**
 * Resend email. No-ops gracefully when RESEND_API_KEY is unset. The confirmation
 * email is inline-styled HTML (email clients ignore <style>/external CSS) in the
 * dark Fat Finger brand: near-black, off-white, the red full-stop.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Fat Finger <brief@fatfinger.news>";

export const hasResend = !!apiKey;
const resend = apiKey ? new Resend(apiKey) : null;

/** Sender identity, honouring the admin Settings → Email overrides. */
async function senderIdentity(): Promise<{ from: string; replyTo?: string }> {
  const s = await getSettingsCached();
  const name = String(s.fromName ?? "").trim();
  const replyTo = String(s.replyTo ?? "").trim() || undefined;
  if (!name) return { from, replyTo };
  const addr = from.match(/<(.+)>/)?.[1];
  return { from: addr ? `${name} <${addr}>` : from, replyTo };
}

function confirmHtml(confirmUrl: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="dark"/><meta name="supported-color-schemes" content="dark"/></head>
  <body style="margin:0;padding:0;background:#0a0b0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f4f4f5;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0a0b0d;">One click confirms it. Your first brief is already being written.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b0d;padding:44px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:468px;background:#101216;border:1px solid #1c1f25;border-radius:16px;overflow:hidden;">
        <tr><td style="height:4px;background:#e5342b;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:34px 38px 0;">
          <div style="font-size:23px;font-weight:700;letter-spacing:-0.4px;color:#f4f4f5;">fatfinger<span style="color:#e5342b;">.</span></div>
          <div style="font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:#5b5e66;margin-top:8px;">Markets &middot; Energy &middot; Macro</div>
        </td></tr>
        <tr><td style="padding:26px 38px 0;">
          <h1 style="font-size:27px;line-height:1.12;margin:0 0 14px;font-weight:800;letter-spacing:-0.4px;color:#f4f4f5;">Almost in.</h1>
          <p style="color:#a9acb3;font-size:15px;line-height:1.62;margin:0 0 14px;">
            Tap below to confirm your email. That is the whole ask.
          </p>
          <p style="color:#a9acb3;font-size:15px;line-height:1.62;margin:0 0 26px;">
            From tomorrow you get one sharp brief before the open: what moved, why it matters, and the one line you will repeat at lunch. Heavy on energy. Light on jargon. Never boring.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#e5342b;border-radius:999px;">
            <a href="${confirmUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.6px;padding:15px 32px;border-radius:999px;">Confirm my email &rarr;</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:28px 38px 0;">
          <p style="font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.7;color:#7c7f87;margin:0;">
            See you at 6:30 AM ET,<br/>the Fat Finger desk
          </p>
        </td></tr>
        <tr><td style="padding:26px 38px 34px;">
          <div style="border-top:1px solid #1c1f25;padding-top:18px;color:#5b5e66;font-size:11px;line-height:1.75;">
            Button not working? Use this link:<br/>
            <a href="${confirmUrl}" style="color:#7c7f87;word-break:break-all;">${confirmUrl}</a><br/><br/>
            Didn't sign up? Ignore this and we will never email you again.<br/>
            Free &middot; most weekdays &middot; unsubscribe in one click &middot; not investment advice.
          </div>
        </td></tr>
      </table>
      <div style="font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#3c3f46;margin-top:18px;letter-spacing:0.5px;">fatfinger.news</div>
    </td></tr>
  </table>
  </body></html>`;
}

function confirmText(confirmUrl: string) {
  return [
    "Almost in.",
    "",
    "Tap the link below to confirm your email. That is the whole ask.",
    "",
    "From tomorrow you get one sharp brief before the open: what moved, why it matters, and the one line you will repeat at lunch. Heavy on energy. Light on jargon. Never boring.",
    "",
    `Confirm: ${confirmUrl}`,
    "",
    "See you at 6:30 AM ET,",
    "the Fat Finger desk",
    "",
    "Didn't sign up? Ignore this and we will never email you again.",
    "Free, most weekdays, unsubscribe in one click. Not investment advice.",
    "fatfinger.news",
  ].join("\n");
}

export async function sendConfirmEmail(
  to: string,
  confirmUrl: string
): Promise<boolean> {
  if (!resend) return false;
  try {
    const id = await senderIdentity();
    const { error } = await resend.emails.send({
      from: id.from,
      replyTo: id.replyTo,
      to,
      subject: "Confirm your email and you're in",
      html: confirmHtml(confirmUrl),
      text: confirmText(confirmUrl),
    });
    return !error;
  } catch {
    return false;
  }
}

/** Short on-brand welcome note (Settings → Email → "Send a welcome email"). */
export async function sendWelcomeEmail(to: string): Promise<boolean> {
  if (!resend) return false;
  try {
    const id = await senderIdentity();
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fatfinger.news";
    const { error } = await resend.emails.send({
      from: id.from,
      replyTo: id.replyTo,
      to,
      subject: "You're in. Here's how the brief works",
      html: `<!doctype html><html><body style="margin:0;background:#0a0b0d;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:#f4f4f5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:36px 14px;"><tr><td align="center">
        <table role="presentation" width="100%" style="max-width:520px;text-align:left;">
          <tr><td style="font-size:22px;font-weight:700;">fatfinger<span style="color:#e5342b;">.</span></td></tr>
          <tr><td style="padding-top:18px;font-size:16px;line-height:1.65;color:#d8d9dc;">
            Welcome to the desk. One brief, most mornings: what actually moved the
            market, the energy angle nobody else leads with, and one chart that
            earns its pixels. Five minutes, no jargon, every story ends with the take.
          </td></tr>
          <tr><td style="padding-top:18px;"><a href="${base}/issues" style="color:#f4f4f5;font-family:monospace;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Read past issues &rarr;</a></td></tr>
          <tr><td style="padding-top:26px;font-family:monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#5b5e66;">Not investment advice.</td></tr>
        </table></td></tr></table></body></html>`,
      text: `Welcome to Fat Finger. One brief, most mornings: what moved the market, the energy angle, one chart. ${base}/issues`,
    });
    return !error;
  } catch {
    return false;
  }
}

// ── The daily issue as an email ───────────────────────────────────────────

/** A real chart image (PNG) for the email via QuickChart - no JS needed. */
function quickChartUrl(c: Issue["chart"]): string {
  const labels = c.data.map((d) => String(d[c.xKey]));
  const values = c.data.map((d) => Number(d[c.yKey]));
  const hi = typeof c.highlightIndex === "number" ? c.highlightIndex : values.length - 1;
  const SIGNAL = "#e5342b";
  const config =
    c.type === "bar"
      ? {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: values.map((_, i) =>
                  i === hi ? SIGNAL : "rgba(139,144,153,0.4)"
                ),
                borderRadius: 3,
              },
            ],
          },
        }
      : {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                data: values,
                borderColor: SIGNAL,
                borderWidth: 3,
                fill: c.type === "area",
                backgroundColor: "rgba(229,52,43,0.12)",
                pointRadius: values.map((_, i) => (i === hi ? 5 : 0)),
                pointBackgroundColor: SIGNAL,
                tension: 0.35,
              },
            ],
          },
        };
  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#8b9099", font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: "#8b9099", font: { size: 11 } }, grid: { color: "rgba(139,144,153,0.16)" } },
    },
  };
  const u = new URL("https://quickchart.io/chart");
  u.searchParams.set("c", JSON.stringify({ ...config, options }));
  u.searchParams.set("backgroundColor", "#0f1115");
  u.searchParams.set("width", "560");
  u.searchParams.set("height", "280");
  u.searchParams.set("devicePixelRatio", "2");
  return u.toString();
}

const T = {
  bg: "#0a0b0d",
  panel: "#111317",
  text: "#f4f4f5",
  body: "#d8d9dc",
  muted: "#8b9099",
  signal: "#e5342b",
  line: "#1c1f25",
};

function take(label: string, text: string) {
  return `<div style="margin:18px 0;border-left:3px solid ${T.signal};padding-left:16px;">
    <div style="font-family:'SF Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${T.signal};">The take</div>
    <div style="font-size:16px;font-style:italic;line-height:1.5;color:${T.text};margin-top:5px;">${text}</div>
  </div>`;
}
function src(s: string) {
  return `<div style="font-family:'SF Mono',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${T.muted};margin-top:10px;">${s}</div>`;
}
function sectionHead(n: string, title: string) {
  return `<div style="margin:34px 0 14px;"><span style="font-family:'SF Mono',monospace;font-size:11px;color:${T.signal};">${n}</span> <span style="font-size:22px;font-weight:800;letter-spacing:-0.4px;text-transform:uppercase;color:${T.text};">${title}</span></div>`;
}

export type IssueEmailOpts = {
  showChart?: boolean;
  showFatFinger?: boolean;
  unsubFooter?: string;
};

export function renderIssueEmail(
  issue: Issue,
  unsubUrl: string,
  base: string,
  opts: IssueEmailOpts = {}
): string {
  const { showChart = true, showFatFinger = true, unsubFooter = "" } = opts;
  const webUrl = `${base}/issues/${issue.slug}`;
  const tape = issue.tape
    .map((t) => {
      const up = t.dir === "up";
      return `<td style="width:50%;padding:7px 10px;border:1px solid ${T.line};font-family:'SF Mono',monospace;font-size:12px;">
        <span style="color:${T.muted};text-transform:uppercase;">${t.label}</span>
        <span style="float:right;color:${T.text};">${t.value} <span style="color:${up ? "#0f9d63" : T.signal};">${up ? "&#9650;" : "&#9660;"} ${t.chg}</span></span>
      </td>`;
    })
    .reduce<string[]>((rows, cell, i) => {
      if (i % 2 === 0) rows.push(`<tr>${cell}`);
      else rows[rows.length - 1] += `${cell}</tr>`;
      return rows;
    }, [])
    .join("");

  const desk = issue.desk
    .map(
      (d, i) =>
        `<tr><td style="padding:8px 0;vertical-align:top;font-family:'SF Mono',monospace;font-size:13px;color:${T.signal};width:30px;">${String(i + 1).padStart(2, "0")}</td>
        <td style="padding:8px 0;"><div style="font-size:15px;font-weight:600;color:${T.text};">${d.headline}</div>
        <div style="font-size:14px;color:${T.muted};margin-top:3px;">${d.take}</div></td></tr>`
    )
    .join("");

  const energy = issue.energy
    .map(
      (e) =>
        `<div style="margin-bottom:22px;"><div style="font-size:18px;font-weight:800;text-transform:uppercase;color:${T.text};">${e.headline}</div>
        <p style="font-size:15px;line-height:1.6;color:${T.body};margin:8px 0 0;">${e.body}</p>${take("", e.take)}${src(e.source)}</div>`
    )
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="dark"/></head>
  <body style="margin:0;padding:0;background:${T.bg};font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:${T.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${issue.preview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.bg};padding:32px 14px;"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;text-align:left;">
      <tr><td style="padding-bottom:16px;border-bottom:1px solid ${T.line};">
        <span style="font-size:22px;font-weight:700;letter-spacing:-0.4px;">fatfinger<span style="color:${T.signal};">.</span></span>
        <span style="float:right;font-family:'SF Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${T.muted};padding-top:6px;">${issue.date}</span>
        <div style="font-size:18px;line-height:1.4;color:#e8e9ec;margin-top:16px;">${issue.preview}</div>
        <div style="font-family:'SF Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${T.muted};margin-top:12px;">Mood: <span style="color:${T.text};">${issue.mood}</span></div>
      </td></tr>

      <tr><td>${sectionHead("01", "The Tape")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${tape}</table>
      </td></tr>

      <tr><td>${sectionHead("02", "The Big Slip")}
        <div style="font-family:'SF Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${T.signal};">${issue.bigSlip.kicker}</div>
        <div style="font-size:27px;font-weight:800;line-height:1.05;text-transform:uppercase;color:${T.text};margin-top:8px;">${issue.bigSlip.headline}</div>
        ${issue.bigSlip.paragraphs.map((p) => `<p style="font-size:16px;line-height:1.65;color:${T.body};margin:14px 0 0;">${p}</p>`).join("")}
        ${take("", issue.bigSlip.take)}${src(issue.bigSlip.source)}
      </td></tr>

      <tr><td>${sectionHead("03", "The Desk")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${desk}</table>
      </td></tr>

      <tr><td>${sectionHead("04", "Energy Desk")}${energy}</td></tr>

      ${
        showFatFinger
          ? `<tr><td>${sectionHead("05", "Fat Finger of the Day")}
        <div style="border:1px solid rgba(229,52,43,0.3);background:rgba(229,52,43,0.06);border-radius:14px;padding:18px;">
          <div style="font-size:18px;font-weight:800;text-transform:uppercase;color:${T.text};">${issue.fatFinger.headline}</div>
          <p style="font-size:15px;line-height:1.6;color:${T.body};margin:8px 0 0;">${issue.fatFinger.body}</p>${take("", issue.fatFinger.take)}${src(issue.fatFinger.source)}
        </div>
      </td></tr>`
          : ""
      }

      ${
        showChart
          ? `<tr><td>${sectionHead(showFatFinger ? "06" : "05", "Chart of the Day")}
        <div style="background:${T.panel};border:1px solid ${T.line};border-radius:14px;padding:16px;">
          <div style="font-size:16px;font-weight:800;text-transform:uppercase;color:${T.text};">${issue.chart.title}</div>
          <div style="font-size:13px;color:${T.muted};margin:4px 0 12px;"><span style="color:${T.signal};">&#8250;</span> ${issue.chart.take}</div>
          <img src="${quickChartUrl(issue.chart)}" width="528" alt="${issue.chart.title}" style="width:100%;border-radius:8px;display:block;"/>
          ${src(issue.chart.source)}
        </div>
      </td></tr>`
          : ""
      }

      <tr><td style="padding-top:30px;border-top:1px solid ${T.line};text-align:center;">
        <p style="font-size:16px;line-height:1.6;color:${T.body};">${issue.signOff}</p>
        <a href="${webUrl}" style="font-family:'SF Mono',monospace;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${T.muted};">Read it on the web &rarr;</a>
      </td></tr>

      <tr><td style="padding-top:24px;text-align:center;font-family:'SF Mono',monospace;font-size:10px;line-height:1.8;letter-spacing:1px;text-transform:uppercase;color:#5b5e66;">
        fatfinger<span style="color:${T.signal};">.</span> &middot; not investment advice &middot; illustrative data<br/>
        ${unsubFooter ? `${unsubFooter}<br/>` : ""}<a href="${unsubUrl}" style="color:#5b5e66;">Unsubscribe</a>
      </td></tr>
    </table>
  </td></tr></table>
  </body></html>`;
}

function issueText(issue: Issue, unsubUrl: string): string {
  return [
    `FAT FINGER. ${issue.date}`,
    issue.preview,
    "",
    `THE BIG SLIP: ${issue.bigSlip.headline}`,
    issue.bigSlip.paragraphs.join("\n\n"),
    `Take: ${issue.bigSlip.take}`,
    "",
    "THE DESK:",
    ...issue.desk.map((d) => `- ${d.headline} (${d.take})`),
    "",
    issue.signOff,
    "",
    `Unsubscribe: ${unsubUrl}`,
    "Not investment advice. Illustrative data.",
  ].join("\n");
}

/** Email the published issue to every confirmed subscriber (batched). */
export async function sendIssue(issue: Issue): Promise<{ sent: number } | null> {
  if (!resend) return null;
  const recipients = await getConfirmedRecipients();
  if (!recipients.length) return { sent: 0 };
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fatfinger.news";

  // honour admin Settings: sender identity + which sections the email includes
  const s = await getSettingsCached();
  const id = await senderIdentity();
  const opts: IssueEmailOpts = {
    showChart: s.includeChart !== false,
    showFatFinger: s.includeFatFinger !== false,
    unsubFooter: String(s.unsubFooter ?? "").trim(),
  };

  let sent = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const batch = chunk.map((r) => {
      const unsubUrl = `${base}/api/unsubscribe?t=${r.unsub_token}`;
      return {
        from: id.from,
        replyTo: id.replyTo,
        to: r.email,
        subject: issue.bigSlip.headline,
        html: renderIssueEmail(issue, unsubUrl, base, opts),
        text: issueText(issue, unsubUrl),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });
    try {
      const { error } = await resend.batch.send(batch);
      if (!error) sent += chunk.length;
    } catch {
      /* keep going with the next batch */
    }
  }
  return { sent };
}
