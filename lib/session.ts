import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const COOKIE = "gemini_spotify_session";
const SECRET = process.env.SESSION_SECRET!;

//called after signup or login to create a session cookie. Encodes the user's ID in a signed JWT and sets it in the response.
export async function setSession(userId: string) {
  //create a signed JWT with a 7-day expiration time
  const token = jwt.sign({ uid: userId }, SECRET, { expiresIn: "7d" });
  //access the cookie store
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

//deletes the session cookie — effectively logs the user out.
export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE, "", { path: "/", maxAge: 0 });
}

//reads the JWT from the cookie and verifies it. returns the user ID (string) if valid, or null if missing/invalid.
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try { return (jwt.verify(token, SECRET) as any).uid; }
  catch { return null; }
}

