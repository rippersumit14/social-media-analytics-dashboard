import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Camera,
  Clock,
  Gauge,
  Image,
  Lightbulb,
  Newspaper,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingCard } from "../components/ui/LoadingCard";
import { SectionCard } from "../components/ui/SectionCard";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DataAvailabilityNotice } from "../components/instagram/DataAvailabilityNotice";
import { ManualMetricsChart } from "../features/analytics/components/ManualMetricsChart";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "../routes/routePaths";
import { creatorNewsService } from "../services/creatorNewsService";
import { dashboardService } from "../services/dashboardService";
import { formatDateTime, formatMetricValue, formatNumber, formatPercent } from "../utils/formatters";
import { hasManualMetrics, hasUnavailableMetrics } from "../utils/metricSources";

const quickActions = [
  { label: "Connect Instagram", icon: Camera, to: routePaths.instagram, variant: "primary" },
  { label: "Open AI Chat", icon: Bot, to: routePaths.chat, variant: "secondary" },
  { label: "Sync Instagram", icon: RefreshCw, to: routePaths.instagram, variant: "secondary" },
  { label: "Generate Snapshot", icon: BarChart3, toast: "Snapshot generation is reserved for the analytics milestone." },
  { label: "Calculate Creator Score", icon: Gauge, toast: "Score calculation will be activated in the creator score milestone." },
  { label: "Generate Insights", icon: BrainCircuit, toast: "Insight generation will be activated in the insights milestone." },
  { label: "Recommendations", icon: Lightbulb, to: routePaths.recommendations, variant: "secondary" },
];

function NewsPreviewCard({ item }) {
  const sourceName = item.sourceName || "Creator news";

  return (
    <article className="app-lift-card overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]">
      <Link to={routePaths.creatorNews} className="block">
        <div className="app-image-zoom h-36 overflow-hidden bg-[var(--app-paper)]">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="news-cover-fallback grid h-full place-items-center text-white">
              <Newspaper aria-hidden="true" size={28} />
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase text-[var(--app-primary)]">{sourceName}</p>
          <h3 className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6 text-[var(--app-text)]">{item.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--app-muted)]">
            {item.summary || "Creator-market update from the public news index."}
          </p>
        </div>
      </Link>
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--app-primary)] hover:underline"
        >
          Read source
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      ) : null}
    </article>
  );
}

function getScoreLevel(score) {
  if (score >= 75) {
    return "Strong";
  }

  if (score >= 50) {
    return "Improving";
  }

  return "Needs data";
}

function QuickActionButton({ action }) {
  const Icon = action.icon;

  if (action.to) {
    return (
      <Button as={Link} to={action.to} variant={action.variant || "secondary"} className="w-full justify-start">
        <Icon aria-hidden="true" size={18} />
        {action.label}
      </Button>
    );
  }

  return (
    <Button type="button" variant="secondary" className="w-full justify-start" onClick={() => toast(action.toast)}>
      <Icon aria-hidden="true" size={18} />
      {action.label}
    </Button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardService.getOverview,
    retry: false,
  });
  const newsQuery = useQuery({
    queryKey: ["creator-news", "dashboard"],
    queryFn: () =>
      creatorNewsService.list({
        category: "all",
        limit: 6,
      }),
    retry: false,
  });

  const account = data?.account;
  const latestSnapshot = data?.latestSnapshot;
  const latestScore = data?.latestScore;
  const latestInsights = data?.latestInsights || [];
  const topMedia = data?.topMedia || [];

  const scoreValue = latestScore?.totalScore ?? latestSnapshot?.creatorScore;
  const score = Number(scoreValue);
  const hasScore = Number.isFinite(score);
  const engagementRate = latestSnapshot?.averageEngagement ?? topMedia[0]?.analytics?.engagementRate;

  const metricCards = useMemo(
    () => [
      {
        label: "Followers",
        value: formatMetricValue(account?.followers ?? latestSnapshot?.followers, account?.metricsAvailability?.followers !== false),
        detail: latestSnapshot ? `${formatNumber(latestSnapshot.followerGrowth)} since last snapshot` : "Connect Instagram to start tracking growth",
        icon: Users,
        tone: "brand",
      },
      {
        label: "Media",
        value: formatMetricValue(account?.mediaCount ?? latestSnapshot?.mediaCount, account?.metricsAvailability?.mediaCount !== false),
        detail: latestSnapshot ? `${formatNumber(latestSnapshot.mediaGrowth)} new media since last snapshot` : "Media sync will populate this card",
        icon: Image,
        tone: "mint",
      },
      {
        label: "Engagement",
        value: Number.isFinite(Number(engagementRate)) ? formatPercent(engagementRate) : "Unavailable",
        detail: latestSnapshot ? `${formatNumber(latestSnapshot.totalEngagement)} total engagements` : "Snapshot data will calculate engagement",
        icon: TrendingUp,
        tone: "amber",
      },
    ],
    [account, engagementRate, latestSnapshot],
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        description="Track your connected Instagram account, creator score, AI insights, and next best actions from one focused workspace."
        actions={
          <>
            <Button as={Link} to={routePaths.chat} variant="secondary">
              <Bot aria-hidden="true" size={18} />
              AI Chat
            </Button>
            <Button as={Link} to={routePaths.instagram}>
              <Camera aria-hidden="true" size={18} />
              {account ? "Instagram" : "Connect"}
            </Button>
          </>
        }
      />

      {account && hasUnavailableMetrics(account) ? <DataAvailabilityNotice type="noProviderMetric" /> : null}
      {account && hasManualMetrics(account) ? <DataAvailabilityNotice type="manualActive" /> : null}
      {account && !account.lastSyncedAt ? <DataAvailabilityNotice type="syncRequired" /> : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingCard rows={4} />
          <LoadingCard rows={4} />
          <LoadingCard rows={4} />
        </div>
      ) : null}

      {!isLoading && error ? (
        <ErrorPanel
          title="Dashboard data is not ready yet"
          message={error?.response?.status === 404 ? "Connect an Instagram account to unlock your overview." : "The dashboard API is unavailable right now. The workspace shell is still ready."}
          action={
            <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw aria-hidden="true" size={18} />
              Retry
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard
          title="Connected account"
          description="Instagram account status and most recent sync details."
          action={<StatusBadge variant={account ? "success" : "warning"}>{account ? "Connected" : "Not connected"}</StatusBadge>}
        >
          {account ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cloud-100 text-brand-700">
                  {account.profileImage ? (
                    <img src={account.profileImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <Camera aria-hidden="true" size={24} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-950">{account.displayName || account.username || "Instagram account"}</h2>
                  <p className="text-sm text-ink-500">{account.username ? `@${account.username}` : "Username unavailable"}</p>
                </div>
              </div>
              <div className="rounded-lg border border-line-200 bg-cloud-50 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-ink-700">
                  <Clock aria-hidden="true" size={16} />
                  Last synced
                </p>
                <p className="mt-1 text-sm text-ink-500">{formatDateTime(account.lastSyncedAt)}</p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Instagram account connected"
              description="Connect Instagram to unlock snapshots, media sync, creator score, and AI insights."
              action={
                <Button as={Link} to={routePaths.instagram}>
                  <Camera aria-hidden="true" size={18} />
                  Connect Instagram
                </Button>
              }
            />
          )}
        </SectionCard>

        <SectionCard title="Creator score" description="A weekly signal based on engagement, growth, consistency, and activity.">
          <div className="flex items-center gap-5">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-blue-100 bg-white">
              <div className="text-center">
                <p className="text-3xl font-semibold text-ink-950">{hasScore ? Math.round(score) : "--"}</p>
                <p className="text-xs font-medium text-ink-500">{hasScore ? "/100" : "No score"}</p>
              </div>
            </div>
            <div>
              <StatusBadge variant={hasScore ? "success" : "neutral"}>{hasScore ? getScoreLevel(score) : "Needs data"}</StatusBadge>
              <p className="mt-3 text-sm leading-6 text-ink-500">
                {latestScore ? `Calculated ${formatDateTime(latestScore.calculatedAt)}.` : "Calculate a score after connecting analytics data."}
              </p>
              <Button as={Link} to={routePaths.creatorScore} variant="secondary" className="mt-4">
                <Target aria-hidden="true" size={18} />
                View score
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <ManualMetricsChart account={account} />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard
          title="Recent insights"
          description="Latest AI or system-generated recommendations for your creator growth."
          action={
            <Button as={Link} to={routePaths.insights} variant="ghost">
              View all
            </Button>
          }
        >
          {latestInsights.length > 0 ? (
            <div className="space-y-3">
              {latestInsights.slice(0, 3).map((insight) => (
                <div key={insight._id || insight.id || insight.title} className="rounded-lg border border-line-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-950">{insight.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-500">{insight.description}</p>
                    </div>
                    <StatusBadge variant={insight.priority === "high" || insight.priority === "critical" ? "warning" : "neutral"}>
                      {insight.priority || "medium"}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No insights yet"
              description="Generate insights after analytics snapshots and creator score data are available."
              action={
                <Button as={Link} to={routePaths.insights} variant="secondary">
                  <BrainCircuit aria-hidden="true" size={18} />
                  Open insights
                </Button>
              }
            />
          )}
        </SectionCard>

        <SectionCard title="Quick actions" description="Shortcuts for the workflows that will power the main dashboard.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <QuickActionButton key={action.label} action={action} />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Creator market updates"
        description={`Daily creator economy, Instagram, AI tools, and platform updates refreshed from ${newsQuery.data?.sourceCount || "50+"} public no-key sources.`}
        action={
          <Button as={Link} to={routePaths.creatorNews} variant="ghost">
            View news
          </Button>
        }
      >
        {newsQuery.isLoading ? (
          <LoadingCard rows={4} />
        ) : null}
        {!newsQuery.isLoading && newsQuery.error ? (
          <ErrorPanel
            title="Creator news unavailable"
            message="The daily creator-market feed could not be loaded. This does not affect analytics or AI features."
          />
        ) : null}
        {!newsQuery.isLoading && !newsQuery.error && (newsQuery.data?.items || []).length === 0 ? (
          <EmptyState
            title="No creator-market updates cached yet"
            description="Open Creator News and refresh the public news feed, or wait for the daily backend automation."
          />
        ) : null}
        {(newsQuery.data?.items || []).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {newsQuery.data.items.map((item) => (
              <NewsPreviewCard key={item._id || item.url} item={item} />
            ))}
          </div>
        ) : null}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr]">
        <SectionCard title="AI assistant" description="Use the assistant for content ideas, performance questions, and planning support.">
          <div className="rounded-lg bg-ink-950 p-5 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <Sparkles aria-hidden="true" size={20} />
            </div>
            <h2 className="mt-5 text-lg font-semibold">Ask what to post next</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              The chat workspace will use memory, notes, and performance context when the AI milestone begins.
            </p>
            <Button as={Link} to={routePaths.chat} className="mt-5 bg-white text-ink-950 hover:bg-cloud-100">
              <Bot aria-hidden="true" size={18} />
              Open AI Chat
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Top content preview" description="Highest-engagement media from the latest sync.">
          {topMedia.length > 0 ? (
            <div className="space-y-3">
              {topMedia.slice(0, 4).map((media) => (
                <div key={media._id || media.mediaId} className="flex items-center gap-3 rounded-lg border border-line-200 p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cloud-100 text-ink-500">
                    <Zap aria-hidden="true" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-950">{media.caption || media.mediaType || "Instagram media"}</p>
                    <p className="text-xs text-ink-500">{formatNumber(media.analytics?.engagementCount)} engagements</p>
                  </div>
                  <StatusBadge>{media.mediaType || "MEDIA"}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No media synced yet"
              description="Synced posts and reels will appear here as the analytics foundation grows."
              action={
                <Button as={Link} to={routePaths.analytics} variant="secondary">
                  <BarChart3 aria-hidden="true" size={18} />
                  View analytics
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>
    </section>
  );
}
