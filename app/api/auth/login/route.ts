import { NextResponse } from "next/server";
import { findByUsername, hashPassword } from "@/lib/users";
import { setSession } from "@/lib/session";

//handles POST requests to /api/auth/login
export async function POST(req: Request) {
   //parse the JSON body sent by the frontend (username + password)
  const { username, password } = await req.json();
  //look for an existing user with this username);
  const u = await findByUsername(username);
  if (!u || u.passHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await setSession(u.id);
                         
  return NextResponse.json({ ok: true });
}


