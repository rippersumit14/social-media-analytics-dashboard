import { Avatar, Button, Chip } from "@mui/material";
import { Camera, Clock, RefreshCw, ShieldCheck, UserRound } from "lucide-react";

import { formatDateTime, formatMetricValue } from "../../utils/formatters";
import { getMetricSourceLabel } from "../../utils/metricSources";

function Metric({ label, value, available = true, source }) {
  if (value === undefined || value === null || value === "") {
    value = "Unavailable";
  }

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{label}</p>
        {source ? (
          <span className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--app-muted)]">
            {getMetricSourceLabel(source)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-[var(--app-text)]">{typeof value === "number" ? formatMetricValue(value, available) : value}</p>
      {!available ? <p className="mt-1 text-xs text-[var(--app-muted)]">Not returned by Meta for this connection.</p> : null}
    </div>
  );
}

export function InstagramAccountCard({ account, onSync, isSyncing }) {
  const displayName = account.displayName || account.username || "Instagram account";
  const username = account.username ? `@${account.username}` : "Username unavailable";

  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            src={account.profileImage || undefined}
            alt={account.profileImage ? `${displayName} profile image` : ""}
            sx={{
              width: 64,
              height: 64,
              bgcolor: "var(--app-elevated)",
              color: "var(--app-primary)",
              border: "1px solid var(--app-border)",
            }}
          >
            <Camera aria-hidden="true" size={26} />
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Chip icon={<ShieldCheck size={15} />} label="Connected" color="success" size="small" />
              <Chip label="Instagram" size="small" variant="outlined" />
            </div>
            <h2 className="mt-3 break-words text-2xl font-semibold text-[var(--app-text)]">{displayName}</h2>
            <p className="break-words text-sm text-[var(--app-muted)]">{username}</p>
          </div>
        </div>
        <Button variant="contained" onClick={onSync} disabled={isSyncing} startIcon={<RefreshCw size={17} />}>
          {isSyncing ? "Synchronizing..." : "Sync creator data"}
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Followers" value={account.metrics?.followers?.value ?? account.followers} available={account.metrics?.followers?.source !== "unavailable"} source={account.metrics?.followers?.source} />
        <Metric label="Media" value={account.metrics?.mediaCount?.value ?? account.mediaCount} available={account.metrics?.mediaCount?.source !== "unavailable"} source={account.metrics?.mediaCount?.source} />
        <Metric label="Account type" value={account.accountType || "Connected professional account"} />
        <Metric label="Last sync" value={formatDateTime(account.lastSyncedAt)} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="flex gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4">
          <UserRound aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--app-primary)]" size={18} />
          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">Connection details</p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
              {account.id ? "CreatorIQ has a backend-confirmed active connection for this account." : "CreatorIQ confirmed the account but did not return a public account identifier."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4">
          <Clock aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--app-primary)]" size={18} />
          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">Sync status</p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
              {account.lastSyncedAt ? `Last synchronized ${formatDateTime(account.lastSyncedAt)}.` : "Not synchronized yet. Run the first sync to prepare analytics and insights."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
