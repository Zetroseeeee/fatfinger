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
  <meta name="viewport" content="width=device-width, initial-scale=1"/></head>
  <body style="margin:0;background:#0a0b0d;font-family:Helvetica,Arial,sans-serif;color:#f5f5f6;-webkit-font-smoothing:antialiased;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">One tap to confirm. Your first brief lands at 6:30 AM ET.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b0d;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;background:#111317;border-radius:18px;border:1px solid #1d2026;">
        <tr><td style="padding:32px 36px 0;">
          <div style="font-size:24px;font-weight:700;letter-spacing:-0.5px;">fatfinger<span style="color:#e5342b;">.</span></div>
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#56585e;margin-top:6px;">The slip that moves markets</div>
        </td></tr>
        <tr><td style="padding:24px 36px 0;">
          <h1 style="font-size:26px;line-height:1.15;margin:0 0 10px;font-weight:800;">You're one tap from the desk.</h1>
          <p style="color:#8a8d94;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Confirm your email and the daily brief starts landing before the open: the number that moved the market, the energy desk nobody else runs, one funny fat-finger moment, and a chart that makes it click.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:#e5342b;color:#f5f5f6;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:15px 30px;border-radius:999px;">Confirm &amp; start reading</a>
        </td></tr>
        <tr><td style="padding:24px 36px 32px;">
          <div style="border-top:1px solid #1d2026;padding-top:18px;color:#56585e;font-size:11px;line-height:1.7;">
            Button not working? Paste this link:<br/>
            <a href="${confirmUrl}" style="color:#8a8d94;word-break:break-all;">${confirmUrl}</a><br/><br/>
            If you didn't sign up, ignore this and you won't hear from us again.<br/>
            Free · most weekdays · unsubscribe anytime · not investment advice.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
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
      subject: "Confirm your Fat Finger subscription",
      html: confirmHtml(confirmUrl),
    });
    return !error;
  } catch {
    return false;
  }
}
