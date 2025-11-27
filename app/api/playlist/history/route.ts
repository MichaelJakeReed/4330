import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getPlaylistHistory } from "@/lib/history";

//GET /api/playlist/history
export async function GET() {
  //get the user ID from the session
  const uid = await getSessionUserId();
  //if no user ID, return empty array
  if (!uid) {
    return NextResponse.json({ playlists: [] }, { status: 200 });
  }
  //get the playlist history for the user
  const rows = await getPlaylistHistory(uid);
//map the rows to the desired format
const playlists = rows.map((row) => ({
  id: row.id,
  name: row.concept.length > 20 ? row.concept.slice(0, 20) + "..." : row.concept, //only first 20 chars
  url: row.spotifyUrl, //spotify url
}));


  return NextResponse.json({ playlists });
}
