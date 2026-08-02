import { Alert, Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

import { routePaths } from "../../routes/routePaths";

const statusCopy = {
  processing: {
    severity: "info",
    icon: CircularProgress,
    title: "Completing your Instagram connection...",
    description: "CreatorIQ is validating the OAuth callback with the backend. This usually takes a moment.",
  },
  success: {
    severity: "success",
    icon: CheckCircle2,
    title: "Instagram connected successfully.",
    description: "Your CreatorIQ workspace can now begin synchronizing available creator data.",
  },
  cancelled: {
    severity: "warning",
    icon: AlertCircle,
    title: "Instagram authorization was cancelled.",
    description: "No account was connected. You can start the connection again whenever you are ready.",
  },
  error: {
    severity: "error",
    icon: AlertCircle,
    title: "We could not complete the Instagram connection.",
    description: "The callback could not be processed. Start a new connection request and try again.",
  },
};

export function InstagramCallbackStatus({ status, message, onRetry }) {
  const copy = statusCopy[status] || statusCopy.error;
  const Icon = copy.icon;

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-6 shadow-sm">
      <Alert
        severity={copy.severity}
        icon={status === "processing" ? <CircularProgress size={20} /> : <Icon aria-hidden="true" size={20} />}
        sx={{ borderRadius: "12px" }}
      >
        <div>
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <p className="mt-2">{message || copy.description}</p>
        </div>
      </Alert>
      <div className="mt-5 flex flex-wrap gap-2">
        {status === "error" || status === "cancelled" ? (
          <Button variant="contained" onClick={onRetry} startIcon={<RefreshCw size={16} />}>
            Try again
          </Button>
        ) : null}
        <Button component={Link} to={routePaths.instagram} variant="outlined">
          Return to Instagram setup
        </Button>
        <Button component={Link} to={routePaths.dashboard} variant="text">
          Go to dashboard
        </Button>
      </div>
    </section>
  );
}
