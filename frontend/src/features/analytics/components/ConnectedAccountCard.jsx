import { Link } from "react-router-dom";
import { Camera, Clock } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { routePaths } from "../../../routes/routePaths";
import { formatDateTime, formatMetricValue } from "../../../utils/formatters";

export function ConnectedAccountCard({ account }) {
  return (
    <SectionCard
      title="Connected account"
      description="Instagram account context used for analytics, scoring, and AI recommendations."
      action={<StatusBadge variant={account ? "success" : "warning"}>{account ? "Connected" : "Action needed"}</StatusBadge>}
    >
      {account ? (
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-brand-700">
              {account.profileImage ? (
                <img src={account.profileImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <Camera aria-hidden="true" size={24} />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink-950">{account.displayName || account.username || "Instagram account"}</h2>
              <p className="truncate text-sm text-ink-500">{account.username ? `@${account.username}` : "Username unavailable"}</p>
              <p className="mt-1 text-xs font-medium uppercase text-ink-500">{account.accountType || "Creator"}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:min-w-72">
            <div className="rounded-lg border border-line-200 bg-cloud-50 p-3">
              <p className="text-xs font-semibold uppercase text-ink-500">Media</p>
              <p className="mt-1 text-lg font-semibold text-ink-950">{formatMetricValue(account.mediaCount, account.metricsAvailability?.mediaCount !== false)}</p>
            </div>
            <div className="rounded-lg border border-line-200 bg-cloud-50 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase text-ink-500">
                <Clock aria-hidden="true" size={13} />
                Synced
              </p>
              <p className="mt-1 text-sm font-medium text-ink-700">{formatDateTime(account.lastSyncedAt)}</p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Instagram account connected"
          description="Connect Instagram before generating analytics snapshots, creator scores, and insights."
          action={
            <Button as={Link} to={routePaths.instagram}>
              <Camera aria-hidden="true" size={18} />
              Connect Instagram
            </Button>
          }
        />
      )}
    </SectionCard>
  );
}
