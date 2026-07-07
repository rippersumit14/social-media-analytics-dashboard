import { Activity, CalendarDays } from "lucide-react";

import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { formatDateTime, formatNumber } from "../../../utils/formatters";

export function RecentSnapshotCard({ snapshot }) {
  return (
    <SectionCard title="Recent analytics snapshot" description="Latest point-in-time metrics stored by the analytics engine.">
      {snapshot ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-line-200 bg-cloud-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700">
              <CalendarDays aria-hidden="true" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-950">{formatDateTime(snapshot.snapshotDate || snapshot.createdAt)}</p>
              <p className="text-xs text-ink-500">Snapshot date</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-line-200 p-3">
              <p className="text-xs font-semibold uppercase text-ink-500">Avg Likes</p>
              <p className="mt-1 text-lg font-semibold text-ink-950">{formatNumber(snapshot.averageLikes)}</p>
            </div>
            <div className="rounded-lg border border-line-200 p-3">
              <p className="text-xs font-semibold uppercase text-ink-500">Avg Comments</p>
              <p className="mt-1 text-lg font-semibold text-ink-950">{formatNumber(snapshot.averageComments)}</p>
            </div>
            <div className="rounded-lg border border-line-200 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase text-ink-500">
                <Activity aria-hidden="true" size={13} />
                Avg Engagement
              </p>
              <p className="mt-1 text-lg font-semibold text-ink-950">{formatNumber(snapshot.averageEngagement)}</p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No analytics snapshot yet"
          description="Generate a snapshot after syncing media to capture follower, content, and engagement metrics."
        />
      )}
    </SectionCard>
  );
}
