"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));

// Custom hook for components
export function useTheme() {
  const store = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme to body
    document.body.style.backgroundColor =
      store.theme === "light" ? "#f4f4f4" : "#121212";
    document.body.style.color = store.theme === "light" ? "#000" : "#fff";
  }, [store.theme]);

  if (!mounted) return { theme: "light", toggleTheme: () => {} };
  return store;
}
