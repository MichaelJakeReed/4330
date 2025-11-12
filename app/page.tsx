"use client";
import { useEffect, useState } from "react";

//main page
export default function Home() {
  //store info about the logged-in user fetched from /api/auth/me
  const [user, setUser] = useState<any>(null);
  //textarea input: the user’s playlist idea
  const [concept, setConcept] = useState("");
  //message or result returned from the backend (success/error)
  const [output, setOutput] = useState("");
   //loading state to disable the button and show “Creating...” while waiting
  const [loading, setLoading] = useState(false);

  //check if the user is logged in
  useEffect(() => {
    //call /api/auth/me endpoint which reads the session cookie
    fetch("/api/auth/me").then((r) => r.json()).then(setUser);
  }, []);

  //if we haven’t fetched the user yet, render nothing
  if (!user) return null;
  //if the user isn’t authenticated redirect to /login
  if (!user.authenticated) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  //kick off the Spotify OAuth flow
  const connectSpotify = () => (window.location.href = "/api/spotify/login");

  //create a new playlist via Gemini + Spotify
  async function createPlaylist() {
    setLoading(true);
    const res = await fetch("/api/playlist/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept }), //send the user’s prompt
    });
    const data = await res.json();
    setLoading(false);
     //display success or error message
    setOutput(
      data.ok
        ? `Playlist created! Open in Spotify: ${data.playlist}`
        : `Error: ${data.error}`
    );
  }
 //render the UI
  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <span>Hello, {user.username}</span>
        {!user.spotifyLinked ? (
          <button
            onClick={connectSpotify}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            Connect Spotify
          </button>
        ) : (
          <span className="text-green-700 text-sm">Spotify Connected</span>
        )}
      </div>

      <textarea
        className="w-full border p-3 h-32"
        placeholder="Describe your playlist idea..."
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
      />

      <button
        onClick={createPlaylist}
        disabled={loading || !user.spotifyLinked}
        className="mt-3 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Playlist"}
      </button>

      {output && (
        <pre className="mt-4 p-3 border rounded bg-gray-50 whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </main>
  );
}
