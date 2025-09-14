"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";

// Modern theme palettes
const lightTheme = {
  background: "linear-gradient(180deg, #FDFDFD 0%, #F4F4F5 100%)",
  color: "#111827",
  primary: "linear-gradient(90deg, #3B82F6, #60A5FA)",
  secondary: "#6B7280",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  shadow: "0 2px 10px rgba(0,0,0,0.05)",
  hoverShadow: "0 4px 20px rgba(0,0,0,0.08)",
};
const darkTheme = {
  background: "linear-gradient(180deg, #000000ff 0%, #000008ff 100%)", // midnight gradient
  color: "#F9FAFB",
  primary: "linear-gradient(90deg, #1A2A4D, #2B3B6A)", // muted deep blue
  secondary: "#9CA3AF",
  cardBg: "#0F1524", // very dark blue for cards
  border: "#1C2536",
  shadow: "0 2px 12px rgba(0,0,0,0.4)",
  hoverShadow: "0 4px 24px rgba(0,0,0,0.5)",
};

// Zustand store
interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));

// Custom hook
export function useTheme() {
  const store = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme && savedTheme !== store.theme) {
      useThemeStore.setState({ theme: savedTheme });
    }
  }, []);

  // Apply theme colors to body
  useEffect(() => {
    if (!mounted) return;

    const theme = store.theme === "light" ? lightTheme : darkTheme;

    Object.assign(document.body.style, {
      background: theme.background,
      color: theme.color,
      transition: "all 0.4s ease",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: "1.6",
    });

    localStorage.setItem("theme", store.theme);
  }, [store.theme, mounted]);

  if (!mounted)
    return { theme: "light", toggleTheme: () => {}, colors: lightTheme };

  return { ...store, colors: store.theme === "light" ? lightTheme : darkTheme };
}
