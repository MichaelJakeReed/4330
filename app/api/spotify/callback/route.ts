import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getMe } from "@/lib/spotify";
import { getSessionUserId, clearSession } from "@/lib/session";
import { getUser, saveUser } from "@/lib/users";

const BASE = process.env.NEXT_PUBLIC_BASE_URL!;

//handles GET /api/spotify/callback
export async function GET(req: Request) {
  try {
    //extract the ?code= and ?state= that Spotify appended to our redirect URI
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    //read the PKCE verifier + state we stored before redirecting to Spotify
    const store = await cookies();
    const verifier = store.get("spotify_verifier")?.value;
    const savedState = store.get("spotify_state")?.value;

    //we can't complete the exchange; restart the OAuth flow.
    if (!verifier || !savedState) {
      return NextResponse.redirect(new URL("/api/spotify/login", BASE));
    }
    if (!code || state !== savedState) {
      store.set("spotify_verifier", "", { path: "/", maxAge: 0 });
      store.set("spotify_state", "", { path: "/", maxAge: 0 });
      return NextResponse.json({ error: "OAuth state mismatch" }, { status: 400 });
    }

    //exchange the authorization code + code_verifier for access/refresh tokens
    const tokens = await exchangeCodeForTokens(code, verifier);

    //confirm we still have a logged-in app user (session cookie intact)
    const uid = await getSessionUserId();
    //no session send back to login page.
    if (!uid) return NextResponse.redirect(new URL("/login", BASE));

    //look up the user in our in-memory store.
    const user = getUser(uid);
    if (!user) {
      // session cookie points to a user that no longer exists (dev restart)
      await clearSession();
      return NextResponse.redirect(new URL("/login", BASE));
    }

    //hit Spotify /me to verify token works
    await getMe(tokens.access_token);

    //persist Spotify credentials on the user object
    user.spotify = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    saveUser(user);

    //clean up the one-time PKCE cookies
    store.set("spotify_verifier", "", { path: "/", maxAge: 0 });
    store.set("spotify_state", "", { path: "/", maxAge: 0 });

    //send the user back to the app's home page
    return NextResponse.redirect(new URL("/", BASE));
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}







