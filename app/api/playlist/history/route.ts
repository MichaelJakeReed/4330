import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getPlaylistHistory } from "@/lib/history";

// GET /api/playlist/history
export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) {
    return NextResponse.json({ playlists: [] }, { status: 200 });
  }

  const rows = await getPlaylistHistory(uid);

const playlists = rows.map((row) => ({
  id: row.id,
  name: row.concept.length > 20 ? row.concept.slice(0, 20) + "..." : row.concept,
  url: row.spotifyUrl,
}));


  return NextResponse.json({ playlists });
}
