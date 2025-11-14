"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setSignup] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  }

  return (
    // Updated: Background is now light blue for both light/dark modes
    // The main text color is dark blue for both light/dark modes
    <main className="flex items-center justify-center min-h-screen bg-blue-100 font-sans text-blue-900">
      
      <div className="w-full max-w-md p-4 md:p-8 m-4">
        
        {/* Title: Changed from font-mono to font-sans for a rounded, professional look */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-blue-950 font-sans">
          Musicanator
        </h1>

        {/* Auth Card: Background is white, dark mode is light blue */}
        <div className="bg-white dark:bg-blue-200 rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-900 dark:text-blue-800">
            {isSignup ? "Create Account" : "Log In"}
          </h2>

          <form onSubmit={submit} className="space-y-5">
            {/* Error Message Box */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* Inputs */}
            <div>
              <label htmlFor="username" className="text-sm font-medium sr-only">Username</label>
              <input
                id="username"
                name="username"
                placeholder="Username"
                autoComplete="username"
                required
                className="border border-blue-300 bg-blue-50 text-blue-900 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                className="border border-blue-300 bg-blue-50 text-blue-900 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white w-full p-3 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="text-center mt-6">
            <button
              className="text-sm text-blue-700 hover:underline focus:outline-none"
              onClick={() => {
                setSignup(!isSignup);
                setError(null);
              }}
            >
              {isSignup
                ? "Already have an account? Log In"
                : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}