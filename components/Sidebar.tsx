"use client";

import { useTheme } from "@lib/theme";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const tabs = ["Home", "Settings", "Report", "Profile"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: isOpen ? 0 : -300,
        width: 250,
        height: "100vh",
        backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e",
        color: theme === "light" ? "#111" : "#f0f0f0",
        transition:
          "left 0.3s ease, background-color 0.3s ease, color 0.3s ease",
        padding: "1.5rem 1rem",
        zIndex: 1000,
        boxShadow: "2px 0 12px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Close Button */}
      <button
        onClick={onClose}
        style={{
          alignSelf: "flex-end",
          padding: "0.25rem 0.5rem",
          fontSize: "1rem",
          border: "none",
          backgroundColor: theme === "light" ? "#eee" : "#333",
          color: theme === "light" ? "#111" : "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            theme === "light" ? "#ddd" : "#444")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor =
            theme === "light" ? "#eee" : "#333")
        }
      >
        ✕
      </button>

      {/* Tabs */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          marginTop: "2rem",
          flexGrow: 1,
        }}
      >
        {tabs.map((tab) => (
          <li
            key={tab}
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f0f0f0" : "#333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {tab}
          </li>
        ))}
      </ul>

      {/* Theme Toggle */}
      <div
        style={{
          position: "absolute",
          bottom: "75px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%", // optional: makes it slightly smaller than full sidebar width
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: theme === "light" ? "#2196f3" : "#555",
            color: "#fff",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              theme === "light" ? "#1976d2" : "#666")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              theme === "light" ? "#2196f3" : "#555")
          }
        >
          {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        </button>
      </div>
      
    </div>
  );
}
