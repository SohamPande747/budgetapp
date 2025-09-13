"use client";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Optional: redirect after login
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h1>Welcome to Budget App</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "1rem 2rem",
          background: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
