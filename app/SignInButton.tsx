"use client";

import { supabase } from "@/lib/supabase";

export default function SignInButton() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`, // redirect after login
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  return (
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
  );
}
