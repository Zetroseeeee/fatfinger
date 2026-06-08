import { NextResponse } from "next/server";
import { hasDb, upsertPending } from "@/lib/db";
import { hasResend, sendConfirmEmail } from "@/lib/email";

/**
 * POST /api/subscribe - newsletter signup (double opt-in).
 *   1. validate email (+ honeypot spam guard)
 *   2. upsert a `pending` subscriber row              → DATABASE_URL (Supabase/Neon)
 *   3. send a confirmation email with a tokenised link → RESEND_API_KEY (Resend)
 *
 * Degrades gracefully: with no keys it validates and returns ok so the funnel
 * works; a real confirmation only goes out when BOTH the DB and Resend are
 * configured (the token must be persisted to be confirmable). We never trust the
 * client; nobody is `confirmed` until they click the link.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function siteUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
}

export async function POST(req: Request) {
  let body: { email?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // a confirmation email is only real if we can persist + send it
  const canConfirm = hasDb && hasResend;

  // Honeypot: bots fill `website` → fake success with the same response shape.
  if (body.website) {
    return NextResponse.json({ ok: true, pendingConfirmation: canConfirm });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const token = crypto.randomUUID();

    if (hasDb) {
      await upsertPending(email, token);
    }

    if (canConfirm) {
      await sendConfirmEmail(email, `${siteUrl(req)}/api/confirm?token=${token}`);
    } else {
      console.info(`[subscribe] captured (no provider): ${email}`);
    }

    return NextResponse.json({ ok: true, pendingConfirmation: canConfirm });
  } catch (err) {
    console.error("[subscribe] error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
