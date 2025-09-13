"use client";

import { useState, ReactNode } from "react";
import { useTheme } from "@lib/theme";
import Hamburger from "../components/Hamburger";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation"; 

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Dynamic colors
  const backgroundColor = theme === "light" ? "#f4f4f4" : "#1e1e1e";
  const textColor = theme === "light" ? "#111" : "#f0f0f0";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          backgroundColor: theme === "light" ? "#fafafa" : "#121212",
          color: textColor,
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: "50px",
            display: "flex",
            alignItems: "center",
            padding: "0 1rem",
            backgroundColor: backgroundColor,
            color: textColor,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "background-color 0.3s ease, color 0.3s ease",
            position: "relative",
            zIndex: 2000, // ✅ higher than Sidebar
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
            }}
            onClick={() => router.push("/home")}
          >
            Budget App
          </h1>
        </div>

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <div style={{ marginTop: "50px", padding: "1rem" }}>{children}</div>
      </body>
    </html>
  );
}
