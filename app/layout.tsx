"use client";

import { useState, useEffect, ReactNode, useRef } from "react";
import { useTheme } from "@lib/theme";
import Hamburger from "../components/Hamburger";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation"; 

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Detect system theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      if (media.matches && theme === "light") toggleTheme();
      if (!media.matches && theme === "dark") toggleTheme();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isSidebarOpen]);

  // Apple-inspired palette
  const backgroundColor =
    theme === "light" ? "#f9f9fb" : "#060620ff";
  const topBarColor =
    theme === "light" ? "rgba(255,255,255,0.7)" : "#000008ff";
  const textColor = theme === "light" ? "#1c1c1e" : "#f5f5f7";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor,
          color: textColor,
          transition: "background-color 0.4s ease, color 0.4s ease",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
            padding: "0 1.5rem",
            backgroundColor: topBarColor,
            color: textColor,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            borderBottom:
              theme === "light"
                ? "1px solid rgba(0,0,0,0.05)"
                : "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.3s ease",
            position: "fixed",
            width: "100%",
            top: 0,
            zIndex: 2000,
            borderRadius: "0 0 16px 16px",
          }}
        >
          <Hamburger onClick={toggleSidebar} />
          <h1
            style={{
              fontSize: "1.5rem",
              margin: 0,
              marginLeft: "1rem",
              cursor: "pointer",
              userSelect: "none",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
            onClick={() => router.push("/")}
          >
            Spendle
          </h1>
        </div>

        {/* Sidebar with overlay */}
        {isSidebarOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              zIndex: 1500,
              transition: "opacity 0.3s ease",
            }}
          />
        )}
        <div
          ref={sidebarRef}
          style={{
            position: "fixed",
            top: 0,
            left: isSidebarOpen ? 0 : "-260px",
            width: "260px",
            height: "100%",
            transition: "left 0.3s ease",
            zIndex: 1600,
          }}
        >
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>

        {/* Main content */}
        <div
          style={{
            marginTop: "70px",
            padding: "1.5rem",
            borderRadius: "20px",
            minHeight: "calc(100vh - 70px)",
            transition: "background-color 0.3s ease",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
