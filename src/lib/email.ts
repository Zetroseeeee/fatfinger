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
  return `<!doctype html><html><body style="margin:0;background:#0a0b0d;font-family:Helvetica,Arial,sans-serif;color:#f5f5f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b0d;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;background:#111317;border-radius:16px;border:1px solid #1d2026;padding:36px;">
        <tr><td>
          <div style="font-size:24px;font-weight:700;letter-spacing:-0.5px;">fatfinger<span style="color:#e5342b;">.</span></div>
          <h1 style="font-size:22px;line-height:1.2;margin:24px 0 8px;">Confirm your spot on the desk.</h1>
          <p style="color:#8a8d94;font-size:14px;line-height:1.6;margin:0 0 24px;">
            One tap and the daily brief lands in your inbox before the open. If you didn't sign up, just ignore this.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:#e5342b;color:#f5f5f6;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:14px 28px;border-radius:999px;">Confirm subscription</a>
          <p style="color:#56585e;font-size:11px;line-height:1.6;margin:28px 0 0;">
            Or paste this link: ${confirmUrl}<br/>
            Not investment advice. Unsubscribe anytime.
          </p>
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
