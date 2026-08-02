import { useCallback, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";

import { createAppTheme } from "../theme/createAppTheme";
import { appTokens, themeStorageKey } from "../theme/tokens";
import { ThemeContext } from "./themeContextValue";

function getSystemMode() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialMode() {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedMode = window.localStorage.getItem(themeStorageKey);

  if (savedMode === "light" || savedMode === "dark") {
    return savedMode;
  }

  return getSystemMode();
}

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);
  const muiTheme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    const root = document.documentElement;
    const palette = appTokens[mode];

    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    root.style.setProperty("--app-bg", palette.background);
    root.style.setProperty("--app-paper", palette.paper);
    root.style.setProperty("--app-elevated", palette.elevated);
    root.style.setProperty("--app-primary", palette.primary);
    root.style.setProperty("--app-secondary", palette.secondary);
    root.style.setProperty("--app-text", palette.text);
    root.style.setProperty("--app-muted", palette.muted);
    root.style.setProperty("--app-border", palette.border);
    root.style.setProperty("--app-shadow", palette.shadow);
    root.style.setProperty("--app-ring", palette.ring);
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemPreferenceChange(event) {
      if (!window.localStorage.getItem(themeStorageKey)) {
        setMode(event.matches ? "dark" : "light");
      }
    }

    mediaQuery.addEventListener("change", handleSystemPreferenceChange);

    return () => mediaQuery.removeEventListener("change", handleSystemPreferenceChange);
  }, []);

  const setThemeMode = useCallback((nextMode) => {
    setMode(nextMode);
    window.localStorage.setItem(themeStorageKey, nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(mode === "dark" ? "light" : "dark");
  }, [mode, setThemeMode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      setThemeMode,
      toggleTheme,
    }),
    [mode, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
