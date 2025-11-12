"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setSignup] = useState(true);

  async function submit() {
    const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) window.location.href = "/";
    else alert((await res.json()).error);
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        {isSignup ? "Create Account" : "Log In"}
      </h1>
      <input
        placeholder="Username"
        className="border w-full p-2 mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        className="border w-full p-2 mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={submit} className="bg-black text-white w-full p-2 rounded">
        {isSignup ? "Sign Up" : "Login"}
      </button>
      <button
        className="underline text-sm mt-2"
        onClick={() => setSignup(!isSignup)}
      >
        {isSignup ? "Already have an account?" : "Need an account?"}
      </button>
    </main>
  );
}
