"use client";

import { useTheme } from "@lib/theme";
import { useState } from "react";

interface HamburgerProps {
  onClick: () => void;
}

export default function Hamburger({ onClick }: HamburgerProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "5px",
        width: "44px",
        height: "44px",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        backgroundColor: isLight ? "#f5f5f7" : "#2a2a2a",
        boxShadow: hovered
          ? isLight
            ? "0 4px 12px rgba(0,0,0,0.15)"
            : "0 4px 12px rgba(0,0,0,0.5)"
          : "0 2px 6px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Bar 1 */}
      <div
        style={{
          width: "20px",
          height: "2px",
          borderRadius: "2px",
          backgroundColor: isLight ? "#111" : "#f5f5f7",
          transition: "all 0.3s ease",
          transform: hovered ? "scaleX(1.1)" : "scaleX(1)",
        }}
      />
      {/* Bar 2 */}
      <div
        style={{
          width: "20px",
          height: "2px",
          borderRadius: "2px",
          backgroundColor: isLight ? "#111" : "#f5f5f7",
          transition: "all 0.3s ease",
          opacity: hovered ? 0.85 : 1,
        }}
      />
      {/* Bar 3 */}
      <div
        style={{
          width: "20px",
          height: "2px",
          borderRadius: "2px",
          backgroundColor: isLight ? "#111" : "#f5f5f7",
          transition: "all 0.3s ease",
          transform: hovered ? "scaleX(0.9)" : "scaleX(1)",
        }}
      />
    </button>
  );
}
