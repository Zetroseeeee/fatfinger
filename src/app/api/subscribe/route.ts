import { NextResponse } from "next/server";

/**
 * POST /api/subscribe - newsletter signup.
 *
 * This is the seam for the self-hosted stack (see ARCHITECTURE.md):
 *   1. validate email (+ honeypot spam guard)
 *   2. upsert a `pending` subscriber row           → DATABASE_URL (Supabase/Neon)
 *   3. send a double-opt-in confirmation email      → RESEND_API_KEY (Resend)
 *
 * It runs safely with NO keys configured: it validates and returns ok so the
 * UI funnel works today. When the env vars land at deploy, fill the two TODOs
 * and it goes live - nothing else changes. We never trust the client; the email
 * isn't "confirmed" until they click the link in step 3.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const hasDb = !!process.env.DATABASE_URL;
  const hasResend = !!process.env.RESEND_API_KEY;

  // Honeypot: real users never fill `website`. Bots do → pretend success with
  // the same response shape so they can't detect they were caught.
  if (body.website) {
    return NextResponse.json({ ok: true, pendingConfirmation: hasResend });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  // RFC 5321 caps an address at 320 chars; reject early to avoid abuse.
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    if (hasDb) {
      // TODO: upsert subscriber as { email, status: 'pending', token, createdAt }
      //   import { sql } from "@/lib/db"
      //   await sql`insert into subscribers (email, status, token) values (...)
      //             on conflict (email) do nothing`
    }

    if (hasResend) {
      // TODO: send the double-opt-in email with React Email (our brand template)
      //   import { Resend } from "resend"
      //   const resend = new Resend(process.env.RESEND_API_KEY)
      //   await resend.emails.send({
      //     from: process.env.EMAIL_FROM!,
      //     to: email,
      //     subject: "Confirm your Fat Finger subscription",
      //     react: ConfirmEmail({ url: `${SITE}/api/confirm?token=${token}` }),
      //   })
    } else {
      // No provider yet - log so it's visible in dev. Client-side success below.
      console.info(`[subscribe] queued (no provider configured): ${email}`);
    }

    return NextResponse.json({
      ok: true,
      // tell the UI whether a real confirmation email is on its way
      pendingConfirmation: hasResend,
    });
  } catch (err) {
    console.error("[subscribe] error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
