import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Tiny single-operator auth for the /admin dashboard. Login checks the password
 * against ADMIN_PASSWORD and sets an httpOnly cookie holding an HMAC token (the
 * password itself never goes in the cookie). With ADMIN_PASSWORD unset, the
 * dashboard is fully locked (no one can log in).
 */
export const ADMIN_COOKIE = "ff_admin";

export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const key = process.env.CRON_SECRET || pw;
  return crypto.createHmac("sha256", key).update("ff-admin-v1").digest("hex");
}

export function checkPassword(pw: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof pw !== "string") return false;
  // constant-time compare on equal-length buffers
  const a = Buffer.from(pw);
  const b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const tok = adminToken();
  if (!tok) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!c || c.length !== tok.length) return false;
  return crypto.timingSafeEqual(Buffer.from(c), Buffer.from(tok));
}

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;
