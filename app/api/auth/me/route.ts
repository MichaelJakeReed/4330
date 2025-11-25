import { NextResponse } from "next/server";
import { getSessionUserId, clearSession } from "@/lib/session";
import { getUser } from "@/lib/users";

//this route handles GET requests to /api/auth/me
//used by the frontend to check if the user is logged in
export async function GET() {
  //read the session cookie and extract the user ID from it
  const id = await getSessionUserId();
  //no session cookie or invalid → not logged in
  if (!id) return NextResponse.json({ authenticated: false });
   //if we do have a id try to look up the corresponding user object in memory
  const u = await getUser(id);

  if (!u) {
    //cookie exists but memory store was reset (dev restart) → clear it
    await clearSession();
    return NextResponse.json({ authenticated: false });
  }

  //found a valid user return info about them
  //authenticated: true → still logged in
  //username: their saved username
  return NextResponse.json({
    authenticated: true,
    username: u.username,
    spotifyLinked: !!u.spotify,
  });
}



