import { Resend } from "resend";

/**
 * Resend email. No-ops gracefully when RESEND_API_KEY is unset. The confirmation
 * email is inline-styled HTML (email clients ignore <style>/external CSS) in the
 * dark Fat Finger brand: near-black, off-white, the red full-stop.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Fat Finger <brief@fatfinger.news>";

export const hasResend = !!apiKey;
const resend = apiKey ? new Resend(apiKey) : null;

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
    const { error } = await resend.emails.send({
      from,
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
