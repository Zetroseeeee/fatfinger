import { NextResponse, type NextRequest } from "next/server";

/**
 * A/B bucketing at the edge. Each new visitor is assigned a sticky variant
 * ("a" = control, "b" = challenger) via the `ff_ab` cookie, 50/50. The variant
 * is also forwarded on a request header so the very first server render matches
 * the cookie we set (no flash, no mismatch). Subsequent visits read the cookie.
 */
const COOKIE = "ff_ab";

export function middleware(req: NextRequest) {
  const existing = req.cookies.get(COOKIE)?.value;
  const bucket =
    existing === "a" || existing === "b"
      ? existing
      : Math.random() < 0.5
        ? "a"
        : "b";

  const headers = new Headers(req.headers);
  headers.set("x-ff-ab", bucket);
  headers.set("x-ff-path", req.nextUrl.pathname); // for the maintenance-mode gate
  const res = NextResponse.next({ request: { headers } });

  if (existing !== bucket) {
    res.cookies.set(COOKIE, bucket, {
      maxAge: 60 * 60 * 24 * 365, // 1 year - keep the visitor in the same arm
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  // pages only - skip API routes, Next internals, and static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.).*)"],
};
