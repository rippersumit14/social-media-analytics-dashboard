import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BarChart3, Gauge, RefreshCw } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingCard } from "../components/ui/LoadingCard";
import { SectionCard } from "../components/ui/SectionCard";
import { DataAvailabilityNotice } from "../components/instagram/DataAvailabilityNotice";
import { StatCard } from "../components/ui/StatCard";
import { AnalyticsActionPanel } from "../features/analytics/components/AnalyticsActionPanel";
import { ConnectedAccountCard } from "../features/analytics/components/ConnectedAccountCard";
import { CreatorScoreCard } from "../features/analytics/components/CreatorScoreCard";
import { ScoreHistoryChart } from "../features/analytics/components/ScoreHistoryChart";
import { useAnalyticsData } from "../features/analytics/hooks/useAnalyticsData";
import { routePaths } from "../routes/routePaths";
import { creatorScoreService } from "../services/creatorScoreService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatNumber } from "../utils/formatters";
import { hasManualMetrics, hasUnavailableMetrics } from "../utils/metricSources";

export default function CreatorScore() {
  const analytics = useAnalyticsData();
  const queryClient = useQueryClient();

  const calculateScore = useMutation({
    mutationFn: creatorScoreService.calculate,
    onSuccess: () => {
      toast.success("Creator score calculated.");
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["creator-score"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to calculate creator score."));
    },
  });

  const breakdown = analytics.latestScore?.breakdown || {};

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Creator Score"
        title="Score engine overview"
        description="See how engagement, growth, consistency, and activity combine into the creator score."
        actions={
          <>
            <Button as={Link} to={routePaths.analytics} variant="secondary">
              <BarChart3 aria-hidden="true" size={18} />
              Analytics
            </Button>
            <Button type="button" onClick={() => calculateScore.mutate()} disabled={!analytics.account || calculateScore.isPending}>
              <RefreshCw aria-hidden="true" size={18} />
              {calculateScore.isPending ? "Calculating..." : "Calculate score"}
            </Button>
          </>
        }
      />

      {analytics.isInitialLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingCard rows={4} />
          <LoadingCard rows={4} />
          <LoadingCard rows={4} />
        </div>
      ) : null}

      {!analytics.isInitialLoading && analytics.scoreError ? (
        <ErrorPanel
          title="Creator score is not available yet"
          message={getApiErrorMessage(analytics.scoreError, "Generate analytics snapshots before calculating a score.")}
        />
      ) : null}

      <ConnectedAccountCard account={analytics.account} />

      {analytics.account && hasUnavailableMetrics(analytics.account) ? <DataAvailabilityNotice type="lowData" /> : null}
      {analytics.account && hasManualMetrics(analytics.account) ? <DataAvailabilityNotice type="manualActive" /> : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <CreatorScoreCard score={analytics.latestScore} compact />
        <AnalyticsActionPanel hasAccount={Boolean(analytics.account)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Followers Used" value={formatNumber(breakdown.followers)} detail="Audience size in scoring input" icon={Gauge} tone="brand" />
        <StatCard label="Media Used" value={formatNumber(breakdown.mediaCount)} detail="Content volume in scoring input" icon={BarChart3} tone="mint" />
        <StatCard label="Total Likes" value={formatNumber(breakdown.totalLikes)} detail="Engagement input" icon={Gauge} tone="amber" />
        <StatCard label="Total Comments" value={formatNumber(breakdown.totalComments)} detail="Conversation input" icon={Gauge} tone="slate" />
      </div>

      <ScoreHistoryChart history={analytics.scoreHistory} />

      <SectionCard title="How the score is built" description="The score is intentionally simple and auditable for creators.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Engagement", "Measures likes, comments, and average engagement against current content performance."],
            ["Growth", "Tracks audience and engagement movement across recent analytics snapshots."],
            ["Consistency", "Rewards steady posting and stable content activity."],
            ["Activity", "Reflects whether the connected account has enough recent synced content."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border border-line-200 bg-cloud-50 p-4">
              <h3 className="text-sm font-semibold text-ink-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {!analytics.latestScore && !analytics.isInitialLoading ? (
        <EmptyState
          title="No score history yet"
          description="Run media sync, generate a snapshot, then calculate your creator score."
        />
      ) : null}
    </section>
  );
}
