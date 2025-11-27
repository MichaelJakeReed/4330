// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

//post /api/auth/logout
export async function POST() {
  //remove the session cookie
  await clearSession();
  return NextResponse.json({ ok: true });
}
