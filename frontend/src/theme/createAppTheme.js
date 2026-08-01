import { createTheme } from "@mui/material/styles";

import { appTokens } from "./tokens";

export function createAppTheme(mode) {
  const palette = appTokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.primary,
      },
      secondary: {
        main: palette.secondary,
      },
      background: {
        default: palette.background,
        paper: palette.paper,
      },
      text: {
        primary: palette.text,
        secondary: palette.muted,
      },
      success: {
        main: palette.success,
      },
      warning: {
        main: palette.warning,
      },
      error: {
        main: palette.error,
      },
      info: {
        main: palette.info,
      },
      divider: palette.border,
    },
    shape: {
      borderRadius: appTokens.radius.md,
    },
    typography: {
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: appTokens.radius.sm,
            boxShadow: "none",
            transition: `transform ${appTokens.transition.duration}ms ${appTokens.transition.easing}, background ${appTokens.transition.duration}ms ${appTokens.transition.easing}, border-color ${appTokens.transition.duration}ms ${appTokens.transition.easing}`,
            "&:hover": {
              boxShadow: "none",
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: appTokens.radius.sm,
            transition: `background ${appTokens.transition.duration}ms ${appTokens.transition.easing}, transform ${appTokens.transition.duration}ms ${appTokens.transition.easing}`,
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: appTokens.radius.sm,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: appTokens.radius.md,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.softShadow,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: `${appTokens.radius.sm}px !important`,
            border: `1px solid ${palette.border}`,
            boxShadow: "none",
            overflow: "hidden",
            "&:before": {
              display: "none",
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: palette.paper,
            color: palette.text,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: appTokens.radius.lg,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadow,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 12,
            fontWeight: 600,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
          },
        },
      },
    },
  });
}
