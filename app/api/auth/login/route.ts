import { NextResponse } from "next/server";
import { findByUsername, hashPassword } from "@/lib/users";
import { setSession } from "@/lib/session";

//handles POST requests to /api/auth/login
export async function POST(req: Request) {
   //parse the JSON body sent by the frontend (username + password)
  const { username, password } = await req.json();
  //look for an existing user with this username
  const u = findByUsername(username);
  //if no user is found or the password doesn’t match return an error
  if (!u || u.passHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  //create a signed jwt session token and set it as a cookie in the browser.
  await setSession(u.id);                         
  return NextResponse.json({ ok: true });
}


