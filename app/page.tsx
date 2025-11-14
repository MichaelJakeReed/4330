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
    // Main container: Light blue bg, dark blue text, centered
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-100 font-sans text-blue-900 p-4">
      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-blue-950 font-sans">
        Musicanator
      </h1>

      {/* Main content card */}
      <div className="w-full max-w-2xl bg-white dark:bg-blue-200 rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header: "Hello, user" + Spotify Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <span className="text-lg font-semibold text-blue-900 mb-4 sm:mb-0">
            Hello, {user.username}
          </span>
          {!user.spotifyLinked ? (
            <button
              onClick={connectSpotify}
              // Keeping the green button as requested!
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
            >
              Connect Spotify
            </button>
          ) : (
            <span className="text-green-700 font-semibold">
              Spotify Connected
            </span>
          )}
        </div>

        {/* Textbox: Rounded and styled */}
        <textarea
          className="w-full border border-blue-300 bg-blue-50 text-blue-900 placeholder-blue-700/60 p-3 h-32 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Describe your playlist idea..."
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />

        {/* Create Playlist Button: Styled to match theme */}
        <button
          onClick={createPlaylist}
          disabled={loading || !user.spotifyLinked}
          className="mt-4 bg-blue-700 hover:bg-blue-800 text-white w-full p-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>

        {/* Output box: Styled to match theme */}
        {output && (
          <pre className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50 whitespace-pre-wrap text-blue-900">
            {output}
          </pre>
        )}
      </div>
    </main>
  );
}

