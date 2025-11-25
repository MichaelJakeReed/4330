import { NextResponse } from "next/server";
import { createUser, findByUsername } from "@/lib/users";
import { setSession } from "@/lib/session";

// handle POST requests to /api/auth/signup
export async function POST(req: Request) {
  const { username, password } = await req.json();

  // basic validation
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 🔑 make sure to AWAIT this now that it hits the DB
  const existing = await findByUsername(username);
  if (existing) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  // 👇 also AWAIT createUser
  const user = await createUser(username, password);

  // set session cookie so they’re logged in immediately
  await setSession(user.id);

  // frontend sees ok:true and redirects to "/"
  return NextResponse.json({ ok: true });
}



