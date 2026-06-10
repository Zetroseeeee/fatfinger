import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { setSettings, SETTINGS_TAG } from "@/lib/settings";

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
  revalidateTag(SETTINGS_TAG); // public pages pick up the change immediately
  return NextResponse.json({ ok: true });
}
