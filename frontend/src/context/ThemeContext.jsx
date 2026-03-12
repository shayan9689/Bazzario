import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(undefined);
const STORAGE_KEY = "bazzario-theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return "light";
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }
  return context;
}
