// app/page.tsx (Login Page)
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error.message);
      }
      if (session) {
        router.push("/home"); // Already logged in
      } else {
        setLoading(false); // Show login button
      }
    };

    checkSession();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push("/home");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`, // Redirect after login
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "5rem" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "2rem",
        padding: "2rem",
      }}
    >
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
