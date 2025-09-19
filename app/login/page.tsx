// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

export default function LoginPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailLogin() {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/home");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const res = await fetch("/api/auth/google");
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Google OAuth
      } else {
        setError(data.error || "Google login failed");
      }
    } catch (err) {
      setError("Something went wrong with Google login");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
      }}
    >
      <div
        style={{
          background: colors.cardBg,
          padding: "2rem",
          borderRadius: "1rem",
          maxWidth: "400px",
          width: "100%",
          boxShadow: colors.shadow,
          textAlign: "center",
          border: `1px solid ${colors.border}`,
        }}
      >
        <h1 style={{ marginBottom: "1.5rem", fontSize: "1.8rem", color: colors.color }}>
          Login
        </h1>

        {error && (
          <p
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "0.6rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.5rem",
            background: colors.cardBg,
            color: colors.color,
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1.5rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.5rem",
            background: colors.cardBg,
            color: colors.color,
          }}
        />

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: colors.primary,
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ margin: "1rem 0", fontSize: "0.8rem", color: colors.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <hr style={{ flex: 1, border: "none", borderBottom: `1px solid ${colors.border}` }} />
          <span style={{ margin: "0 0.75rem" }}>OR</span>
          <hr style={{ flex: 1, border: "none", borderBottom: `1px solid ${colors.border}` }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            width: "100%",
            padding: "0.8rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.5rem",
            background: colors.cardBg,
            color: colors.color,
            fontSize: "0.9rem",
            boxShadow: colors.shadow,
          }}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: "20px", height: "20px" }}
          />
          Login with Google
        </button>

        <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: colors.secondary }}>
          Don't have an account?{" "}
          <a href="/login/signup" style={{ color: colors.primary, textDecoration: "underline" }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
