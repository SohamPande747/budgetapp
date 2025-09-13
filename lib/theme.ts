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


// "use client";

// import { create } from "zustand";
// import { useEffect, useState } from "react";

// interface ThemeStore {
//   theme: "light" | "dark";
//   toggleTheme: () => void;
// }

// export const useThemeStore = create<ThemeStore>((set) => ({
//   theme:
//     typeof window !== "undefined" &&
//     window.matchMedia("(prefers-color-scheme: dark)").matches
//       ? "dark"
//       : "light",
//   toggleTheme: () =>
//     set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
// }));

// export function useTheme() {
//   const store = useThemeStore();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);

//     document.body.style.transition =
//       "background 0.8s ease, color 0.8s ease, border-color 0.8s ease";

//     if (store.theme === "light") {
//       // Light theme: soft pastel gradient with a hint of color
//       document.body.style.background =
//         "linear-gradient(135deg, #fef9f3, #ffe4e1, #d0eaff)";
//       document.body.style.color = "#1a1a1a";
//       document.body.style.borderColor = "#e2e8f0"; // soft gray border
//     } else {
//       // Dark theme: rich muted gradient with subtle highlights
//       document.body.style.background =
//         "linear-gradient(135deg, #0b0f1a, #1a1f2e, #2a3345)";
//       document.body.style.color = "#e0e6f0";
//       document.body.style.borderColor = "#3a4a6b";
//     }

//     // Accent colors: dynamic and slightly playful
//     const accentColor = store.theme === "light" ? "#ff7e6b" : "#6ec1ff";
//     document.documentElement.style.setProperty("--accent-color", accentColor);

//     // Optional subtle text shadows for depth
//     document.body.style.textShadow =
//       store.theme === "light"
//         ? "0 1px 2px rgba(0,0,0,0.05)"
//         : "0 1px 2px rgba(0,0,0,0.4)";
//   }, [store.theme]);

//   if (!mounted) return { theme: "light", toggleTheme: () => {} };
//   return store;
// }
