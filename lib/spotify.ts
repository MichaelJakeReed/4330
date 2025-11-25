import crypto from "crypto";
import { getSessionUserId } from "./session";
import { getUser, saveUser } from "./users";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;
const TOKEN_URL = "https://accounts.spotify.com/api/token";

export function genVerifier() {
  return crypto.randomBytes(64).toString("base64url");
}

export function genChallenge(verifier: string) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return Buffer.from(hash).toString("base64url");
}

export function authUrl(challenge: string, state: string) {
  const scope = [
    "playlist-modify-private",
    "playlist-modify-public",
    "playlist-read-private",
    "user-read-private"
  ].join(" ");

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

export async function exchangeCodeForTokens(code: string, verifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    code_verifier: verifier,
  });

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


export async function withSpotifyToken<T>(fn: (token: string) => Promise<T>) {
  const uid = await getSessionUserId();
  if (!uid) throw new Error("Not logged in");

  const user = await getUser(uid);
  if (!user || !user.spotify) throw new Error("Spotify not connected");
  if (Date.now() >= user.spotify.expiresAt) throw new Error("Spotify token expired — reconnect needed");

  return fn(user.spotify.accessToken);
}

export async function getMe(token: string) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function searchTracks(token: string, query: string) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.tracks?.items?.[0]?.uri;
}

// Counts how many existing playlists the user has that begin with "Musicanator Playlist"
// This is used to number playlist creations sequentially
export async function countMusicanatorPlaylists(token: string, prefix = "Musicanator Playlist"): Promise<number> {
  let url: string | null = "https://api.spotify.com/v1/me/playlists?limit=50";
  let count = 0;

  while (url) {
    // Fetches a page of the user's playlists
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch playlists (${res.status}): ${text}`);
    }

    // Spotify returns playlists + a "next" URL for pagination
    const data: any = await res.json();

    // Count playlists created
    for (const pl of data.items ?? []) {
      if (typeof pl.name === "string" && pl.name.startsWith(prefix)) {
        count++;
      }
    }

    // Move to next page if present
    url = data.next ?? null;
  }

  return count;
}

// Creates a Spotify playlist
// Used by Musicanator to store the user's prompt inside the playlist metadata/description
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


