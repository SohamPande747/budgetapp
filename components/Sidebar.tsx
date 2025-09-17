"use client";

import { useTheme } from "@lib/theme";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [hovered, setHovered] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const tabs = [
    { name: "Home", path: "/home" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Settings", path: "/settings" },
    { name: "Report", path: "/report" },
  ];

  const sidebarBg =
    theme === "light"
      ? "rgba(255, 255, 255, 0.75)"
      : "rgba(28, 28, 30, 0.75)";
  const textColor = theme === "light" ? "#111" : "#f5f5f7";

  // 🔹 Load user on mount & subscribe to auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/"); // redirect to landing/login page
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: isOpen ? 0 : -300,
        width: 260,
        height: "100vh",
        backgroundColor: sidebarBg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        color: textColor,
        transition:
          "left 0.35s ease, background-color 0.3s ease, color 0.3s ease",
        padding: "1.5rem 1rem",
        zIndex: 1000,
        boxShadow: "4px 0 20px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        borderTopRightRadius: "18px",
        borderBottomRightRadius: "18px",
      }}
    >
      Profile Section
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          marginTop: "2.75rem",
          borderRadius: "12px",
          backgroundColor: theme === "light" ? "#f9f9f9" : "#2c2c2e",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => router.push("/profile")}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: theme === "light" ? "#ddd" : "#444",
            marginRight: "0.75rem",
          }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {user ? user.email : "Guest User"}
          </p>
          <span
            style={{
              fontSize: "0.85rem",
              opacity: 0.7,
            }}
          >
            {user ? "View Profile" : "Sign In"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          flexGrow: 1,
        }}
      >
        {tabs.map((tab) => (
          <li
            key={tab.name}
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor:
                hovered === tab.name
                  ? theme === "light"
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(255,255,255,0.1)"
                  : "transparent",
              transition: "all 0.25s ease",
              fontWeight: 500,
              fontSize: "1rem",
              letterSpacing: "-0.01em",
            }}
            onClick={() => {
              router.push(tab.path);
              onClose();
            }}
            onMouseEnter={() => setHovered(tab.name)}
            onMouseLeave={() => setHovered(null)}
          >
            {tab.name}
          </li>
        ))}
      </ul>

      {/* Footer Actions */}
      <div
        style={{
          padding: "1rem",
          borderTop:
            theme === "light"
              ? "1px solid rgba(0,0,0,0.08)"
              : "1px solid rgba(255,255,255,0.1)",
          marginBottom: "25px",
        }}
      >
        {/* Theme Toggle */}
        <div
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
            justifyContent: "space-between",
            padding: "0.5rem 0.75rem",
            borderRadius: "50px",
            backgroundColor: theme === "light" ? "#e0e0e5" : "#3a3a3c",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </span>
          <div
            style={{
              width: 40,
              height: 20,
              borderRadius: "50px",
              backgroundColor: theme === "light" ? "#bbb" : "#666",
              position: "relative",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute",
                top: 1,
                left: theme === "light" ? 2 : 20,
                transition: "left 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
