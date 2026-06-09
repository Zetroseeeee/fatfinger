import { unsubscribeByToken } from "@/lib/db";

/**
 * GET/POST /api/unsubscribe?t=<token> - one-click unsubscribe (honours the
 * List-Unsubscribe + List-Unsubscribe-Post headers on the daily issue, so it
 * works straight from Gmail/Apple Mail's native unsubscribe button too).
 */
function page(title: string, body: string, code = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${title} · fatfinger.</title></head>
    <body style="margin:0;background:#f7f5ef;color:#0a0b0d;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;">
      <div style="max-width:420px;padding:40px;text-align:center;">
        <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;">fatfinger<span style="color:#e5342b;">.</span></div>
        <h1 style="font-size:24px;margin:22px 0 8px;">${title}</h1>
        <p style="color:#56585e;font-size:15px;line-height:1.6;">${body}</p>
        <a href="https://www.fatfinger.news" style="display:inline-block;margin-top:22px;font-family:'SF Mono',monospace;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#0a0b0d;">Back to fatfinger.news &rarr;</a>
      </div>
    </body></html>`,
    { status: code, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

async function handle(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const ok = token ? await unsubscribeByToken(token) : false;
  return ok
    ? page("You're unsubscribed.", "You won't get the brief any more. No hard feelings. You can resubscribe any time.")
    : page("Link expired", "That unsubscribe link didn't work. It may already be done.", 410);
}

export const GET = handle;
export const POST = handle;
