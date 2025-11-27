import crypto from "crypto";
import { getSessionUserId } from "./session";
import { getUser, saveUser } from "./users";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;
const TOKEN_URL = "https://accounts.spotify.com/api/token";

//generates a code verifier for PKCE
export function genVerifier() {
  return crypto.randomBytes(64).toString("base64url");
}

//generates a code challenge from the verifier
export function genChallenge(verifier: string) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return Buffer.from(hash).toString("base64url");
}

//generates the Spotify authorization URL, also what permisions to get
export function authUrl(challenge: string, state: string) {
  const scope = [
    "playlist-modify-private",
    "playlist-modify-public",
    "playlist-read-private",
    "user-read-private"
  ].join(" ");

  //construct the URL with query parameters
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

//exchanges authorization code for access and refresh tokens
export async function exchangeCodeForTokens(code: string, verifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    code_verifier: verifier,
  });

  //make the POST request to Spotify's token endpoint
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}

//refreshes the access token using the refresh token
export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID, 
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Spotify token refresh failed (${res.status}): ${text}`);
  }
  return JSON.parse(text);
}


//wrapper to ensure a valid Spotify access token before calling the provided function
export async function withSpotifyToken<T>(fn: (token: string) => Promise<T>) {
  const uid = await getSessionUserId();
  if (!uid) throw new Error("Not logged in");

  const user = await getUser(uid);
  if (!user || !user.spotify) {
    throw new Error("Spotify not connected");
  }

  let { accessToken, refreshToken, expiresAt } = user.spotify;
  //check if the access token is expired
  const now = Date.now();
  if (now >= expiresAt) {
    if (!refreshToken) {
      throw new Error("Spotify token expired — reconnect needed");
    }

    const refreshed = await refreshAccessToken(refreshToken);

    accessToken = refreshed.access_token;
    const newExpiresAt = now + refreshed.expires_in * 1000;
    //spotify may or may not return a new refresh token
    if (refreshed.refresh_token) {
      refreshToken = refreshed.refresh_token;
    }
    //save updated tokens to user record
    user.spotify = {
      accessToken,
      refreshToken,
      expiresAt: newExpiresAt,
    };
    await saveUser(user);
  }

  return fn(accessToken);
}
//fetches the user's Spotify profile information
export async function getMe(token: string) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

//searches for a track by query and returns the first matching track's URI
export async function searchTracks(token: string, query: string) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.tracks?.items?.[0]?.uri;
}

//counts how many existing playlists the user has that begin with "Musicanator Playlist"
//this is used to number playlist creations sequentially
export async function countMusicanatorPlaylists(token: string, prefix = "Musicanator Playlist"): Promise<number> {
  let url: string | null = "https://api.spotify.com/v1/me/playlists?limit=50";
  let count = 0;

  while (url) {
    //fetches a page of the user's playlists
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch playlists (${res.status}): ${text}`);
    }

    //spotify returns playlists + a "next" URL for pagination
    const data: any = await res.json();

    //count playlists created
    for (const pl of data.items ?? []) {
      if (typeof pl.name === "string" && pl.name.startsWith(prefix)) {
        count++;
      }
    }

    //move to next page if present
    url = data.next ?? null;
  }

  return count;
}

//creates a Spotify playlist
//used  to store the user's prompt inside the playlist metadata/description
export async function createPlaylist(token: string, userId: string, name: string, description: string) {
  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, public: false }),
  });
  return res.json();
}

export async function addTracks(token: string, playlistId: string, uris: string[]) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ uris }),
  });
  return res.json();
}


