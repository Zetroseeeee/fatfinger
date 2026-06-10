import { confirmByToken } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { setting } from "@/lib/settings";

/**
 * GET /api/confirm?token=… - the double-opt-in landing. Flips a pending
 * subscriber to `confirmed` and shows a branded paper confirmation page.
 */
function page(title: string, body: string, ok: boolean) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title} · fatfinger.</title></head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f5ef;color:#0a0b0d;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:460px;padding:40px;text-align:center;">
      <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;">fatfinger<span style="color:#e5342b;">.</span></div>
      <h1 style="font-size:40px;line-height:1;margin:28px 0 12px;text-transform:uppercase;">${title}<span style="color:${ok ? "#e5342b" : "#0a0b0d"};">.</span></h1>
      <p style="color:#56585e;font-size:15px;line-height:1.6;margin:0 0 28px;">${body}</p>
      <a href="/" style="display:inline-block;background:#0a0b0d;color:#f7f5ef;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:14px 28px;border-radius:999px;">Back to fatfinger.</a>
    </div>
  </body></html>`;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const email = token ? await confirmByToken(token) : null;

  // optional welcome note (Settings → Email), best-effort
  if (email && (await setting("welcomeEmail", false))) {
    sendWelcomeEmail(email).catch(() => {});
  }

  const html = email
    ? page(
        "You're on the desk",
        "Confirmed. The first slip lands at 6:30 AM ET, most weekdays.",
        true
      )
    : page(
        "Link expired",
        "That confirmation link is invalid or already used. Try subscribing again.",
        false
      );

  return new Response(html, {
    status: email ? 200 : 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
