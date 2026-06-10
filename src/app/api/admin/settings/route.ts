import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { setSettings } from "@/lib/settings";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  await setSettings(body);
  return NextResponse.json({ ok: true });
}
