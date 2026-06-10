import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasDb, upsertPending, recordConversion, confirmByToken } from "@/lib/db";
import { hasResend, sendConfirmEmail, sendWelcomeEmail } from "@/lib/email";
import { getSettingsCached } from "@/lib/settings";

/**
 * POST /api/subscribe - newsletter signup (double opt-in).
 *   1. validate email (+ honeypot spam guard)
 *   2. upsert a `pending` subscriber row              → DATABASE_URL (Supabase/Neon)
 *   3. send a confirmation email with a tokenised link → RESEND_API_KEY (Resend)
 *   4. attribute the signup to the visitor's A/B arm   → ff_ab cookie
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

  // attribution: A/B arm + first-touch marketing source (set client/edge-side)
  const jar = await cookies();
  const armCookie = jar.get("ff_ab")?.value;
  const arm = armCookie === "a" || armCookie === "b" ? armCookie : null;
  let src: Record<string, unknown> | null = null;
  const srcCookie = jar.get("ff_src")?.value;
  if (srcCookie) {
    try {
      src = JSON.parse(decodeURIComponent(srcCookie));
    } catch {
      /* malformed cookie - ignore */
    }
  }

  try {
    const token = crypto.randomUUID();
    const settings = await getSettingsCached();
    const doubleOptIn = settings.doubleOptIn !== false;

    if (hasDb) {
      await upsertPending(email, token, arm, src);
    }
    if (arm) {
      await recordConversion(arm);
    }

    if (!doubleOptIn && hasDb) {
      // single opt-in (Settings → Email): confirm immediately, no email gate
      await confirmByToken(token);
      if (settings.welcomeEmail && hasResend) await sendWelcomeEmail(email);
      return NextResponse.json({ ok: true, pendingConfirmation: false });
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
