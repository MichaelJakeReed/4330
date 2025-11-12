import { NextResponse } from "next/server";
import { createUser, findByUsername } from "@/lib/users";
import { setSession } from "@/lib/session";

//handle POST requests to /api/auth/signup
export async function POST(req: Request) {
  //parse the request body (the JSON data sent by the frontend)
  const { username, password } = await req.json();
  //validate input
  if (!username || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  //check if a user with this username already exists
  if (findByUsername(username)) return NextResponse.json({ error: "Username taken" }, { status: 409 });

  //create a new user record and save it in memory
  //internally, createUser() will:
  // - Generate a unique ID
  // - Hash the password for security
  // - Store { id, username, passHash } in a Map
  const user = createUser(username, password);
  await setSession(user.id);                      // 👈 await
  return NextResponse.json({ ok: true });
}


