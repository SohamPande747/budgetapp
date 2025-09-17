"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@lib/theme";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const colors = {
    bg: isLight ? "#f9fafc" : "#0f1117",
    section: isLight ? "rgba(255,255,255,0.6)" : "rgba(25,28,38,0.6)",
    text: isLight ? "#1a1a1a" : "#f5f5f5",
    subtext: isLight ? "#555" : "#bbb",
    primary: "#2a5dff",
    gradient: isLight
      ? "linear-gradient(135deg, #f9fafc 0%, #eef2f7 100%)"
      : "linear-gradient(135deg, #0f1117 0%, #1a1d29 100%)",
  };

  return (
    <main
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: colors.gradient,
        color: colors.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: "140%",
            height: "140%",
            background:
              "radial-gradient(circle at center, rgba(42,93,255,0.15), transparent 70%)",
            animation: "pulse 8s ease-in-out infinite",
            zIndex: 0,
          }}
        />
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: 700,
            marginBottom: "20px",
            lineHeight: 1.2,
            zIndex: 1,
            animation: "fadeInUp 1s ease-out",
          }}
        >
          <span
            style={{
              background: colors.primary,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Smarter
          </span>{" "}
          Money Management
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            maxWidth: "650px",
            marginBottom: "40px",
            color: colors.subtext,
            zIndex: 1,
            animation: "fadeInUp 1.3s ease-out",
          }}
        >
          A beautifully simple way to track your income, expenses, and savings. 
          Designed with elegance. Built for clarity.
        </p>
        <button
          onClick={() => router.push("/signup")}
          style={{
            padding: "16px 42px",
            fontSize: "1.2rem",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(90deg,#2a5dff,#00c6ff)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            position: "relative",
            overflow: "hidden",
            zIndex: 1,
            marginRight: "12px",
          }}
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "16px 42px",
            fontSize: "1.2rem",
            borderRadius: "999px",
            border: isLight ? "1px solid #d1d5db" : "1px solid #333",
            background: "transparent",
            color: colors.text,
            cursor: "pointer",
            fontWeight: 600,
            zIndex: 1,
          }}
        >
          Sign In
        </button>
      </section>

      {/* Features Section */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          padding: "80px 60px",
        }}
      >
        {[
          {
            title: "Crystal-Clear Insights",
            desc: "See your spending and earnings in a way that feels effortless.",
          },
          {
            title: "Seamless Tracking",
            desc: "Log expenses and incomes instantly with an intuitive interface.",
          },
          {
            title: "Privacy First",
            desc: "Your data stays secure — always encrypted, always private.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              padding: "40px",
              borderRadius: "16px",
              background: colors.section,
              backdropFilter: "blur(12px)",
              boxShadow: isLight
                ? "0 4px 20px rgba(0,0,0,0.05)"
                : "0 6px 30px rgba(0,0,0,0.4)",
              textAlign: "center",
              transform: "translateY(0)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-10px) scale(1.02)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0) scale(1)")
            }
          >
            <h3 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: "1rem", color: colors.subtext }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
<section
  style={{
    textAlign: "center",
    padding: "60px 40px",
    margin: "80px auto",
    width: "90%",
    maxWidth: "100%",
    borderRadius: "20px",
    background: `linear-gradient(90deg, ${colors.primary}, #00c6ff)`,
    color: "#fff",
    boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Subtle gradient glow */}
  <div
    style={{
      position: "absolute",
      top: 0,
      left: "-20%",
      width: "140%",
      height: "100%",
      background:
        "radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 70%)",
      zIndex: 0,
      animation: "pulse 12s ease-in-out infinite",
    }}
  />

  <h2
    style={{
      fontSize: "2.2rem",
      fontWeight: 700,
      marginBottom: "16px",
      zIndex: 1,
      position: "relative",
    }}
  >
    Ready to Experience <span style={{ color: "#fffacd" }}>Clarity?</span>
  </h2>
  <p
    style={{
      fontSize: "1.1rem",
      marginBottom: "32px",
      maxWidth: "900px",
      marginInline: "auto",
      opacity: 0.9,
      zIndex: 1,
      position: "relative",
    }}
  >
    Join thousands simplifying their money management.  
    Get started today and see the difference.
  </p>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      flexWrap: "wrap",
      zIndex: 1,
      position: "relative",
    }}
  >
    <button
      onClick={() => router.push("/signup")}
      style={{
        padding: "14px 38px",
        fontSize: "1.1rem",
        borderRadius: "50px",
        border: "none",
        background: "#fff",
        color: colors.primary,
        cursor: "pointer",
        fontWeight: "bold",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 4px 15px rgba(0,0,0,0.15)";
      }}
    >
      Create Free Account
    </button>
    <button
      onClick={() => router.push("/login")}
      style={{
        padding: "14px 38px",
        fontSize: "1.1rem",
        borderRadius: "50px",
        border: "2px solid rgba(255,255,255,0.85)",
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      Sign In
    </button>
  </div>
</section>


      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          color: colors.subtext,
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} Spendle. All rights reserved.
      </footer>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
