import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BarChart3, NotebookPen } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { SectionCard } from "../components/ui/SectionCard";
import { GenerateInsightsButton } from "../features/insights/components/GenerateInsightsButton";
import { InsightCard } from "../features/insights/components/InsightCard";
import { InsightsEmptyState } from "../features/insights/components/InsightsEmptyState";
import { InsightsSkeleton } from "../features/insights/components/InsightsSkeleton";
import { InsightsToolbar } from "../features/insights/components/InsightsToolbar";
import { routePaths } from "../routes/routePaths";
import { dashboardService } from "../services/dashboardService";
import { insightsService } from "../services/insightsService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDateTime } from "../utils/formatters";

const NO_ACCOUNT_MESSAGE = "Instagram account not found";
const EMPTY_INSIGHTS = [];

function isNoAccountError(error) {
  return getApiErrorMessage(error, "").toLowerCase().includes(NO_ACCOUNT_MESSAGE.toLowerCase());
}

function insightMatchesSearch(insight, search) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [insight.title, insight.description, insight.recommendation, insight.type, insight.priority]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

export default function Insights() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardService.getOverview,
    retry: false,
  });

  const insightsQuery = useQuery({
    queryKey: ["creator-insights", "list"],
    queryFn: () => insightsService.list(50),
    retry: false,
  });

  const generateInsights = useMutation({
    mutationFn: insightsService.generate,
    onSuccess: (result) => {
      const count = Number(result?.insightCount || result?.insights?.length || 0);
      toast.success(count > 0 ? `${count} insight${count === 1 ? "" : "s"} generated.` : "Insights checked. No new recommendations generated.");
      queryClient.invalidateQueries({ queryKey: ["creator-insights"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to generate insights."));
    },
  });

  const insights = insightsQuery.data || EMPTY_INSIGHTS;
  const account = dashboardQuery.data?.account;
  const noAccount = (!dashboardQuery.isLoading && !dashboardQuery.error && !account) || isNoAccountError(insightsQuery.error);
  const lastGeneratedAt = insights[0]?.generatedAt || insights[0]?.createdAt;

  const filteredInsights = useMemo(
    () =>
      insights.filter((insight) => {
        const matchesPriority = priority === "all" || insight.priority === priority;

        return matchesPriority && insightMatchesSearch(insight, search);
      }),
    [insights, priority, search],
  );

  const shouldShowError = !noAccount && (insightsQuery.error || dashboardQuery.error);
  const isLoading = insightsQuery.isLoading || dashboardQuery.isLoading;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Creator Insights"
        title="Insights workspace"
        description="Turn your latest analytics into focused recommendations for improving growth, consistency, engagement, and activity."
        actions={
          <>
            <Button as={Link} to={routePaths.analytics} variant="secondary">
              <BarChart3 aria-hidden="true" size={18} />
              Analytics
            </Button>
            <Button as={Link} to={routePaths.notes} variant="secondary">
              <NotebookPen aria-hidden="true" size={18} />
              Notes
            </Button>
            <GenerateInsightsButton
              disabled={noAccount}
              isGenerating={generateInsights.isPending}
              onGenerate={() => generateInsights.mutate()}
            />
          </>
        }
      />

      <SectionCard
        title="Latest insight cycle"
        description={
          lastGeneratedAt
            ? `Last generated ${formatDateTime(lastGeneratedAt)}. Active insights are refreshed whenever the backend generates a new set.`
            : "Generate insights after analytics snapshots and creator score data are available."
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line-200 bg-cloud-50 p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">Active insights</p>
            <p className="mt-2 text-2xl font-semibold text-ink-950">{insights.length}</p>
          </div>
          <div className="rounded-lg border border-line-200 bg-cloud-50 p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">Visible after filters</p>
            <p className="mt-2 text-2xl font-semibold text-ink-950">{filteredInsights.length}</p>
          </div>
          <div className="rounded-lg border border-line-200 bg-cloud-50 p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">Connected account</p>
            <p className="mt-2 truncate text-lg font-semibold text-ink-950">{account?.username || "Not connected"}</p>
          </div>
        </div>
      </SectionCard>

      {isLoading ? <InsightsSkeleton /> : null}

      {!isLoading && noAccount ? <InsightsEmptyState type="no-account" /> : null}

      {!isLoading && shouldShowError ? (
        <ErrorPanel
          title="Unable to load insights"
          message={getApiErrorMessage(insightsQuery.error || dashboardQuery.error, "Check that the backend is running and try again.")}
        />
      ) : null}

      {!isLoading && !noAccount && !shouldShowError ? (
        <>
          <InsightsToolbar search={search} priority={priority} onSearchChange={setSearch} onPriorityChange={setPriority} />

          {insights.length === 0 ? (
            <InsightsEmptyState onGenerate={() => generateInsights.mutate()} isGenerating={generateInsights.isPending} />
          ) : filteredInsights.length === 0 ? (
            <InsightsEmptyState type="no-results" />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredInsights.map((insight) => (
                <InsightCard key={insight._id || insight.id || insight.title} insight={insight} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
