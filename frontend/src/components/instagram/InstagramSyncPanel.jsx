import { Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { BarChart3, BrainCircuit, CheckCircle2, Gauge, RefreshCw } from "lucide-react";

import { routePaths } from "../../routes/routePaths";

function ResultLine({ label, value }) {
  if (value === undefined || value === null) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-3">
      <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--app-text)]">{value}</p>
    </div>
  );
}

export function InstagramSyncPanel({ account, onSync, isSyncing, lastSyncResult }) {
  const mediaResult = lastSyncResult?.media;

  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Synchronization</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
            Synchronization updates available account, media, and analytics information used across CreatorIQ.
          </p>
        </div>
        <Button variant="contained" onClick={onSync} disabled={!account || isSyncing} startIcon={isSyncing ? <CircularProgress color="inherit" size={18} /> : <RefreshCw size={17} />}>
          {isSyncing ? "Synchronizing..." : "Sync creator data"}
        </Button>
      </div>

      {lastSyncResult ? (
        <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4 text-teal-900">
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-semibold">Your available Instagram creator data has been synchronized successfully.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ResultLine label="Synced media" value={mediaResult?.syncedCount} />
                <ResultLine label="Inserted" value={mediaResult?.insertedCount} />
                <ResultLine label="Updated" value={mediaResult?.updatedCount} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button component={Link} to={routePaths.dashboard} variant="outlined" size="small">
                  View dashboard
                </Button>
                <Button component={Link} to={routePaths.analytics} variant="outlined" size="small" startIcon={<BarChart3 size={15} />}>
                  Open analytics
                </Button>
                <Button component={Link} to={routePaths.creatorScore} variant="outlined" size="small" startIcon={<Gauge size={15} />}>
                  Review score
                </Button>
                <Button component={Link} to={routePaths.insights} variant="outlined" size="small" startIcon={<BrainCircuit size={15} />}>
                  Generate insights
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4 text-sm leading-6 text-[var(--app-muted)]">
          {account ? "Run sync after connecting or reconnecting Instagram. The backend performs the current media sync request synchronously, then creates an analytics snapshot." : "Connect Instagram before running synchronization."}
        </div>
      )}
    </section>
  );
}
