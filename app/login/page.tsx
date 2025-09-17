"use client";
import { useState } from "react";
import { useTheme } from "@/lib/theme"; // adjust path if needed

export default function LoginPage() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin() {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Login successful! Redirecting...");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
        transition: "all 0.4s ease",
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
          Welcome Back
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
        {success && (
          <p
            style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "0.6rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {success}
          </p>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.5rem",
            fontSize: "0.95rem",
            background: colors.cardBg,
            color: colors.color,
          }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1.5rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.5rem",
            fontSize: "0.95rem",
            background: colors.cardBg,
            color: colors.color,
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: colors.primary,
            color: "#fff",
            fontWeight: 600,
            border: "none",
            borderRadius: "0.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1rem",
            transition: "all 0.3s ease",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div
          style={{
            margin: "1rem 0",
            fontSize: "0.8rem",
            color: colors.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <hr
            style={{
              flex: 1,
              border: "none",
              borderBottom: `1px solid ${colors.border}`,
            }}
          />
          <span style={{ margin: "0 0.75rem" }}>OR</span>
          <hr
            style={{
              flex: 1,
              border: "none",
              borderBottom: `1px solid ${colors.border}`,
            }}
          />
        </div>

        <a
          href="/api/auth/google"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            width: "100%",
            padding: "0.8rem",
            border: `1px solid ${colors.border}`,
            borderRadius: "0.5rem",
            color: colors.color,
            background: colors.cardBg,
            textDecoration: "none",
            fontSize: "0.9rem",
            boxShadow: colors.shadow,
            transition: "all 0.3s ease",
          }}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: "20px", height: "20px" }}
          />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
