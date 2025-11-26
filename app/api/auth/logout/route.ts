// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

// POST /api/auth/logout
export async function POST() {
  // remove the JWT session cookie
  await clearSession();
  return NextResponse.json({ ok: true });
}
