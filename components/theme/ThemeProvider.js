"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", setTheme: () => {}, toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = "bn_theme";

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignora */
    }
    const current = saved || document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setThemeState(current);
  }, []);

  function setTheme(next) {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignora */
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
  }

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}
