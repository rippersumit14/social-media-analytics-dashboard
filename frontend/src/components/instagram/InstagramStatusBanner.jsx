import { Alert, Button, CircularProgress } from "@mui/material";
import { CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

const statusCopy = {
  loading: {
    severity: "info",
    icon: RefreshCw,
    title: "Checking Instagram connection",
    description: "CreatorIQ is checking whether your workspace already has a connected Instagram account.",
  },
  not_connected: {
    severity: "warning",
    icon: ShieldAlert,
    title: "Instagram is not connected",
    description: "Connect a supported Instagram professional account to unlock analytics, Creator Score, insights, and more relevant AI guidance.",
  },
  starting_connection: {
    severity: "info",
    icon: RefreshCw,
    title: "Starting Instagram authorization",
    description: "CreatorIQ is requesting a secure authorization URL from the backend.",
  },
  synchronizing: {
    severity: "info",
    icon: RefreshCw,
    title: "Synchronizing creator data",
    description: "Available account, media, and analytics information is being refreshed.",
  },
  connected_never_synced: {
    severity: "success",
    icon: ShieldCheck,
    title: "Instagram connected",
    description: "Your account is connected. Run the first sync to make creator data available across the workspace.",
  },
  synchronized: {
    severity: "success",
    icon: CheckCircle2,
    title: "Instagram connected and ready",
    description: "Your connected Instagram account is available for analytics, Creator Score, insights, and AI guidance.",
  },
  error: {
    severity: "error",
    icon: ShieldAlert,
    title: "Instagram request needs attention",
    description: "The Instagram request could not be completed. Try again or refresh the connection status.",
  },
};

export function InstagramStatusBanner({ state, error, onConnect, onSync, isConnecting, isSyncing, hasAccount }) {
  const copy = statusCopy[state] || statusCopy.error;
  const Icon = copy.icon;
  const showConnect = !hasAccount && state !== "loading";
  const showSync = hasAccount && state !== "synchronizing";

  return (
    <Alert
      severity={copy.severity}
      icon={state === "starting_connection" || state === "synchronizing" ? <CircularProgress size={18} /> : <Icon aria-hidden="true" size={20} />}
      action={
        <div className="flex flex-wrap gap-2">
          {showConnect ? (
            <Button color="inherit" size="small" onClick={onConnect} disabled={isConnecting}>
              {isConnecting ? "Redirecting..." : "Connect Instagram"}
            </Button>
          ) : null}
          {showSync ? (
            <Button color="inherit" size="small" onClick={onSync} disabled={isSyncing}>
              {isSyncing ? "Synchronizing..." : "Sync now"}
            </Button>
          ) : null}
        </div>
      }
      sx={{
        border: "1px solid var(--app-border)",
        borderRadius: "12px",
        alignItems: "flex-start",
      }}
    >
      <div>
        <p className="font-semibold">{copy.title}</p>
        <p>{error?.message || copy.description}</p>
      </div>
    </Alert>
  );
}
