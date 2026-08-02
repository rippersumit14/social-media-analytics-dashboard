import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BrainCircuit, Lightbulb, RefreshCw, Sparkles, Target } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { DataAvailabilityNotice } from "../components/instagram/DataAvailabilityNotice";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingCard } from "../components/ui/LoadingCard";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { routePaths } from "../routes/routePaths";
import { dashboardService } from "../services/dashboardService";
import { recommendationService } from "../services/recommendationService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDateTime, formatNumber } from "../utils/formatters";
import { hasManualMetrics, hasUnavailableMetrics } from "../utils/metricSources";

const priorityVariant = {
  high: "warning",
  medium: "neutral",
  low: "success",
};

function labelValue(value, fallback = "Unavailable") {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function RecommendationCard({ recommendation }) {
  return (
    <article className="rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={priorityVariant[recommendation.priority] || "neutral"}>
              {labelValue(recommendation.priority, "priority unavailable")}
            </StatusBadge>
            {recommendation.type ? <StatusBadge>{recommendation.type}</StatusBadge> : null}
            {recommendation.source ? <StatusBadge>{recommendation.source}</StatusBadge> : null}
          </div>
          <h2 className="mt-3 break-words text-base font-semibold text-[var(--app-text)]">
            {labelValue(recommendation.title, "Untitled recommendation")}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]">
          <Target aria-hidden="true" size={16} />
          Impact {formatNumber(recommendation.expectedImpact)}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--app-muted)]">
        {labelValue(recommendation.description, "No description provided by the backend.")}
      </p>

      {recommendation.action ? (
        <div className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
          <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">Recommended action</p>
          <p className="mt-1 text-sm leading-6 text-[var(--app-text)]">{recommendation.action}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--app-border)] pt-4 text-xs text-[var(--app-muted)]">
        <span>Created {formatDateTime(recommendation.createdAt)}</span>
        <span aria-hidden="true">/</span>
        <span>{recommendation.isRead ? "Read" : "Unread"}</span>
        <span aria-hidden="true">/</span>
        <span>{recommendation.isActive ? "Active" : "Inactive"}</span>
      </div>
    </article>
  );
}

export default function Recommendations() {
  const queryClient = useQueryClient();
  const recommendationsQuery = useQuery({
    queryKey: ["recommendations"],
    queryFn: recommendationService.list,
    retry: false,
  });
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardService.getOverview,
    retry: false,
  });

  const generateRecommendations = useMutation({
    mutationFn: recommendationService.generate,
    onSuccess: (recommendations) => {
      toast.success(
        recommendations.length > 0
          ? `${recommendations.length} recommendation${recommendations.length === 1 ? "" : "s"} generated.`
          : "Recommendations checked. No new recommendation was returned.",
      );
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to generate recommendations."));
    },
  });

  const recommendations = recommendationsQuery.data || [];
  const account = dashboardQuery.data?.account;
  const isNoAccount = recommendationsQuery.error?.response?.status === 404;

  return (
    <section className="space-y-6 text-[var(--app-text)]">
      <PageHeader
        eyebrow="Recommendations"
        title="Creator growth recommendations"
        description="Review active backend-generated recommendations based on available analytics, creator score, and insight context."
        actions={
          <>
            <Button as={Link} to={routePaths.insights} variant="secondary">
              <BrainCircuit aria-hidden="true" size={18} />
              Insights
            </Button>
            <Button type="button" onClick={() => generateRecommendations.mutate()} disabled={generateRecommendations.isPending}>
              <Sparkles aria-hidden="true" size={18} />
              {generateRecommendations.isPending ? "Generating..." : "Generate"}
            </Button>
          </>
        }
      />

      {account && hasUnavailableMetrics(account) ? <DataAvailabilityNotice type="lowData" /> : null}
      {account && hasManualMetrics(account) ? <DataAvailabilityNotice type="manualActive" /> : null}

      {recommendationsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingCard rows={5} />
          <LoadingCard rows={5} />
        </div>
      ) : null}

      {!recommendationsQuery.isLoading && recommendationsQuery.error ? (
        <ErrorPanel
          title={isNoAccount ? "Instagram account required" : "Unable to load recommendations"}
          message={
            isNoAccount
              ? "Connect Instagram and generate analytics context before requesting recommendations."
              : getApiErrorMessage(recommendationsQuery.error, "Check the backend server and try again.")
          }
          action={
            isNoAccount ? (
              <Button as={Link} to={routePaths.instagram} variant="secondary">
                Connect Instagram
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => recommendationsQuery.refetch()} disabled={recommendationsQuery.isFetching}>
                <RefreshCw aria-hidden="true" size={18} />
                Retry
              </Button>
            )
          }
        />
      ) : null}

      {!recommendationsQuery.isLoading && !recommendationsQuery.error && recommendations.length === 0 ? (
        <EmptyState
          title="No active recommendations yet"
          description="Generate recommendations after connecting Instagram and producing analytics or creator-score data."
          action={
            <Button type="button" onClick={() => generateRecommendations.mutate()} disabled={generateRecommendations.isPending}>
              <Lightbulb aria-hidden="true" size={18} />
              Generate recommendations
            </Button>
          }
        />
      ) : null}

      {recommendations.length > 0 ? (
        <SectionCard title="Active recommendations" description="These records come directly from the backend recommendation engine.">
          <div className="grid gap-4 xl:grid-cols-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation._id || recommendation.id || recommendation.title} recommendation={recommendation} />
            ))}
          </div>
        </SectionCard>
      ) : null}
    </section>
  );
}
