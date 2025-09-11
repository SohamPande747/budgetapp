"use client";

import { useState } from "react";
import { useTheme } from "@lib/theme";

interface HamburgerProps {
  onClick: () => void;
}

export default function Hamburger({ onClick }: HamburgerProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={onClick}
      style={{
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: "0.5rem",
        border: "none",
        borderRadius: "8px",
        backgroundColor: isLight ? "#e0e0e0" : "#2a2a2a",
        color: isLight ? "#111" : "#f0f0f0",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = isLight ? "#d5d5d5" : "#3a3a3a")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = isLight ? "#e0e0e0" : "#2a2a2a")
      }
    >
      &#9776; {/* Hamburger Icon */}
    </button>
  );
}
