import { Link } from "react-router-dom";
import { BarChart3, BrainCircuit, Gauge, RefreshCw } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingCard } from "../components/ui/LoadingCard";
import { SectionCard } from "../components/ui/SectionCard";
import { DataAvailabilityNotice } from "../components/instagram/DataAvailabilityNotice";
import { AnalyticsActionPanel } from "../features/analytics/components/AnalyticsActionPanel";
import { AnalyticsMetricGrid } from "../features/analytics/components/AnalyticsMetricGrid";
import { ConnectedAccountCard } from "../features/analytics/components/ConnectedAccountCard";
import { CreatorScoreCard } from "../features/analytics/components/CreatorScoreCard";
import { ManualMetricsChart } from "../features/analytics/components/ManualMetricsChart";
import { RecentSnapshotCard } from "../features/analytics/components/RecentSnapshotCard";
import { ScoreHistoryChart } from "../features/analytics/components/ScoreHistoryChart";
import { useAnalyticsData } from "../features/analytics/hooks/useAnalyticsData";
import { routePaths } from "../routes/routePaths";
import { getApiErrorMessage } from "../utils/apiError";
import { hasManualMetrics, hasUnavailableMetrics } from "../utils/metricSources";

export default function Analytics() {
  const analytics = useAnalyticsData();

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Creator analytics dashboard"
        description="Understand account health, content performance, engagement trends, and the next steps in your analytics pipeline."
        actions={
          <>
            <Button as={Link} to={routePaths.creatorScore} variant="secondary">
              <Gauge aria-hidden="true" size={18} />
              Creator Score
            </Button>
            <Button as={Link} to={routePaths.insights}>
              <BrainCircuit aria-hidden="true" size={18} />
              Insights
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

      {!analytics.isInitialLoading && analytics.dashboardError ? (
        <ErrorPanel
          title="Analytics data is not available yet"
          message={getApiErrorMessage(analytics.dashboardError, "Connect Instagram or retry once the backend is available.")}
        />
      ) : null}

      <ConnectedAccountCard account={analytics.account} />

      {analytics.account && hasUnavailableMetrics(analytics.account) ? <DataAvailabilityNotice type="noProviderMetric" /> : null}
      {analytics.account && hasManualMetrics(analytics.account) ? <DataAvailabilityNotice type="manualActive" /> : null}

      <AnalyticsMetricGrid account={analytics.account} snapshot={analytics.latestSnapshot} score={analytics.latestScore} />

      <ManualMetricsChart account={analytics.account} />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <CreatorScoreCard score={analytics.latestScore} />
        <AnalyticsActionPanel hasAccount={Boolean(analytics.account)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <RecentSnapshotCard snapshot={analytics.latestSnapshot} />
        <SectionCard
          title="Recent insights"
          description="Fresh recommendations from the creator insights engine."
          action={
            <Button as={Link} to={routePaths.insights} variant="ghost">
              View all
            </Button>
          }
        >
          {analytics.latestInsights.length > 0 ? (
            <div className="space-y-3">
              {analytics.latestInsights.slice(0, 4).map((insight) => (
                <div key={insight._id || insight.id || insight.title} className="rounded-lg border border-line-200 p-4">
                  <p className="text-sm font-semibold text-ink-950">{insight.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">{insight.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No insights generated yet"
              description="Generate insights after snapshots and creator score data are available."
              action={
                <Button as={Link} to={routePaths.insights} variant="secondary">
                  <BrainCircuit aria-hidden="true" size={18} />
                  Open insights
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>

      <ScoreHistoryChart history={analytics.scoreHistory} />

      <SectionCard title="Analytics pipeline" description="Recommended order for fresh, reliable analytics data.">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "1. Sync media", icon: RefreshCw },
            { label: "2. Snapshot", icon: BarChart3 },
            { label: "3. Calculate score", icon: Gauge },
            { label: "4. Generate insights", icon: BrainCircuit },
          ].map((step) => (
            <div key={step.label} className="rounded-lg border border-line-200 bg-cloud-50 p-4">
              <step.icon aria-hidden="true" className="text-brand-700" size={20} />
              <p className="mt-3 text-sm font-semibold text-ink-950">{step.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
