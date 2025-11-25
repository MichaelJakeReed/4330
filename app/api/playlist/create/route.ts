import { NextResponse } from "next/server";
import {
  withSpotifyToken,
  getMe,
  searchTracks,
  createPlaylist,
  addTracks,
  countMusicanatorPlaylists,
} from "@/lib/spotify";
import { generateSongs } from "@/lib/gemini";
import { getSessionUserId } from "@/lib/session";
import { savePlaylistHistory } from "@/lib/history";

// handles POST /api/playlist/create
export async function POST(req: Request) {
  const { concept } = await req.json();

  // Validate input early
  if (!concept) {
    return NextResponse.json({ error: "Missing concept" }, { status: 400 });
  }

  // Make sure the app user is logged in (we need their id for history)
  const uid = await getSessionUserId();
  if (!uid) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    // Wrap the whole flow with withSpotifyToken so we always have a valid token
    const result = await withSpotifyToken(async (token) => {
      // Get the current Spotify user
      const me = await getMe(token);

      // Ask Gemini to produce ~10 lines like "Artist - Title" for this concept
      const songList = await generateSongs(concept);

      // For each suggested line, search Spotify and grab the top match's URI
      const uris: string[] = [];
      for (const line of songList) {
        const uri = await searchTracks(token, line);
        if (uri) uris.push(uri);
      }

      // If Gemini produced lines that didn't map to actual Spotify tracks → fail
      if (!uris.length) throw new Error("No songs found");

      // Count existing Musicanator playlists for this user
      const existingCount = await countMusicanatorPlaylists(token);

      // Name the new playlist with the next number
      const playlistName = `Musicanator Playlist #${existingCount + 1}`;

      // Create a new playlist under the user's account
      const playlist = await createPlaylist(token, me.id, playlistName, concept);

      // Add all URIs to the playlist (we currently generate ~10)
      await addTracks(token, playlist.id, uris);

      // 💾 Save history in DB for this user
      await savePlaylistHistory(
        uid,
        concept,
        playlist.external_urls.spotify,
        playlist.id
      );

      // Return the public URL so the frontend can show "Open in Spotify"
      return playlist.external_urls.spotify;
    });

    // Response to frontend
    return NextResponse.json({ ok: true, playlist: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

