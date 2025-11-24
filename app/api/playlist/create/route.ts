import { NextResponse } from "next/server";
import { withSpotifyToken, getMe, searchTracks, createPlaylist, addTracks, countMusicanatorPlaylists } from "@/lib/spotify";
import { generateSongs } from "@/lib/gemini";

//handles POST /api/playlist/create
export async function POST(req: Request) {
  const { concept } = await req.json();
  // Validate input early
  if (!concept) return NextResponse.json({ error: "Missing concept" }, { status: 400 });

  try {
    //wrap the whole flow with withSpotifyToken so we always have a valid token
    const result = await withSpotifyToken(async (token) => {
    //get the current Spotify user
      const me = await getMe(token);
    //ask Gemini to produce ~10 lines like "Artist - Title" for this concept
      const songList = await generateSongs(concept);
     //for each suggested line search Spotify and grab the top match's URI
      const uris: string[] = [];
      for (const line of songList) {
        const uri = await searchTracks(token, line);
        if (uri) uris.push(uri);
      }
      //if Gemini produced lines that didn't map to actual Spotify tracks throw fail
      if (!uris.length) throw new Error("No songs found");

      // Count existing Musicanator playlists for this user
      const existingCount = await countMusicanatorPlaylists(token);
      // Name the new playlist with the next number
      const playlistName = `Musicanator Playlist #${existingCount +1}`;
      //create a new playlist under the user's account
      const playlist = await createPlaylist(token, me.id, playlistName, concept);
      
      //add all URIs to the playlist up to 100, we do 10(im broke and lazy)
      await addTracks(token, playlist.id, uris);
      //return the public URL so the frontend can show "Open in Spotify"
      return playlist.external_urls.spotify;
    });

    //testing response
    return NextResponse.json({ ok: true, playlist: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
