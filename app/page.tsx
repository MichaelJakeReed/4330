"use client";
import { useEffect, useState } from "react";

type PlaylistItem = {
  id: string;
  name: string;
  url: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [concept, setConcept] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PlaylistItem[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((userData) => {
        setUser(userData);
        if (userData && userData.authenticated) {
           fetchHistory();
        }
      });
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/playlist/history"); 
      const data = await res.json();
      if (data.playlists) setHistory(data.playlists);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  if (!user) return null;
  if (!user.authenticated) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const connectSpotify = () => (window.location.href = "/api/spotify/login");

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      // whether it succeeds or not, send them to login
      window.location.href = "/login";
    }
  }

  async function createPlaylist() {
    setLoading(true);
    try {
      const res = await fetch("/api/playlist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });
      const data = await res.json();
      
      if (data.ok) {
        setOutput(`Playlist created! Open in Spotify: ${data.playlist}`);
        const newPlaylist: PlaylistItem = {
            id: Date.now().toString(),
            name: concept.substring(0, 20) + "...", 
            url: data.playlist 
        };
        setHistory(prev => [newPlaylist, ...prev]); 
        
        //Open the sidebar automatically when a new item is added
        setIsSidebarOpen(true); 
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (err) {
      setOutput("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-blue-100 font-sans text-blue-900 overflow-hidden">
      

      <aside 
        className={`
          bg-blue-900 text-white flex flex-col shrink-0 
          transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"}
        `}
      >
        {/* Added min-w-[16rem] to inner div to prevent text squishing during animation */}
        <div className="w-64 flex flex-col h-full">
            <div className="p-6 border-b border-blue-800 flex justify-between items-center">
                <h2 className="text-xl font-bold whitespace-nowrap">Your History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {history.length === 0 ? (
                    <p className="text-blue-300 text-sm italic whitespace-nowrap">No playlists yet.</p>
                ) : (
                    history.map((item, index) => (
                        <a 
                            key={index} 
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-blue-800 hover:bg-blue-700 transition duration-200 text-sm whitespace-nowrap"
                        >
                            <div className="font-semibold truncate">{item.name}</div>
                            <div className="text-blue-300 text-xs">Open Spotify ↗</div>
                        </a>
                    ))
                )}
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/*Toggle Button (Top Left of Main Area) */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 text-blue-900 p-2 rounded-md hover:bg-blue-200 transition-colors"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >

            {isSidebarOpen ? (
                // 'X' Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                // Hamburger Menu Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            )}
        </button>

        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-blue-950 font-sans">
          Musicanator
        </h1>

        <div className="w-full max-w-2xl bg-white dark:bg-blue-200 rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <span className="text-lg font-semibold text-blue-900">
              Hello, {user.username}
            </span>

            <div className="flex items-center gap-3">
              {!user.spotifyLinked ? (
                <button
                  onClick={connectSpotify}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Connect Spotify
                </button>
              ) : (
                <span className="text-green-700 font-semibold">
                  Spotify Connected
                </span>
              )}

              <button
                onClick={logout}
                className="border border-red-500 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition duration-200"
              >
                Log Out
              </button>
            </div>
          </div>

          <textarea
            className="w-full border border-blue-300 bg-blue-50 text-blue-900 placeholder-blue-700/60 p-3 h-32 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Describe your playlist idea..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />

          <button
            onClick={createPlaylist}
            disabled={loading || !user.spotifyLinked}
            className="mt-4 bg-blue-700 hover:bg-blue-800 text-white w-full p-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Playlist"}
          </button>

          {output && (
            <pre className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50 whitespace-pre-wrap text-blue-900">
              {output}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}