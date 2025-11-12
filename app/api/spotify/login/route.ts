import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { genVerifier, genChallenge, authUrl } from "@/lib/spotify";
import { getSessionUserId } from "@/lib/session";
import { getUser } from "@/lib/users";
import crypto from "crypto";

const BASE = process.env.NEXT_PUBLIC_BASE_URL!;

//handles GET /api/spotify/login
export async function GET() {
  //require the app user to be logged in before starting Spotify OAuth.
  const uid = await getSessionUserId();
  const u = uid ? getUser(uid) : null;
  //not logged in (or stale cookie) -> send to /login
  if (!u) {
    return NextResponse.redirect(new URL("/login", BASE));
  }

  //generate PKCE values and a CSRF "state"
  const verifier = genVerifier();
  const challenge = genChallenge(verifier);
  const state = crypto.randomUUID();

  //store verifier + state in HTTP-only cookies so the callback can validate them.
  const store = await cookies();
  store.set("spotify_verifier", verifier, { httpOnly: true, sameSite: "lax", path: "/" });
  store.set("spotify_state", state, { httpOnly: true, sameSite: "lax", path: "/" });

  //redirect the browser to Spotify’s /authorize with PKCE and your requested scopes.
  return NextResponse.redirect(authUrl(challenge, state));
}




