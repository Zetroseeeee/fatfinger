import { NextResponse } from "next/server";
import { checkPassword, adminToken, ADMIN_COOKIE } from "@/lib/admin";

export async function POST(req: Request) {
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    /* empty */
  }
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const tok = adminToken();
  const res = NextResponse.json({ ok: true });
  if (tok) {
    res.cookies.set(ADMIN_COOKIE, tok, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
