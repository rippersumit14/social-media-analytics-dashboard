import { IconButton, Tooltip } from "@mui/material";
import { Moon, Sun } from "lucide-react";

import { useThemeMode } from "../../hooks/useThemeMode";

export function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useThemeMode();
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip title={label}>
      <IconButton
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        className={className}
        sx={{
          border: "1px solid var(--landing-border)",
          color: "var(--landing-text)",
          backgroundColor: "var(--landing-card)",
          "&:hover": {
            backgroundColor: "var(--landing-soft)",
          },
        }}
      >
        {isDark ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
      </IconButton>
    </Tooltip>
  );
}
