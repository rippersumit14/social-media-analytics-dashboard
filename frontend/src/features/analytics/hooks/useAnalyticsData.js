import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../../services/analyticsService";
import { creatorScoreService } from "../../../services/creatorScoreService";
import { dashboardService } from "../../../services/dashboardService";
import { insightsService } from "../../../services/insightsService";

export function useAnalyticsData() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardService.getOverview,
    retry: false,
  });

  const analyticsHistoryQuery = useQuery({
    queryKey: ["analytics", "history"],
    queryFn: () => analyticsService.getHistory(30),
    retry: false,
  });

  const scoreLatestQuery = useQuery({
    queryKey: ["creator-score", "latest"],
    queryFn: creatorScoreService.getLatest,
    retry: false,
  });

  const scoreHistoryQuery = useQuery({
    queryKey: ["creator-score", "history"],
    queryFn: () => creatorScoreService.getHistory(30),
    retry: false,
  });

  const insightsQuery = useQuery({
    queryKey: ["creator-insights", "list"],
    queryFn: () => insightsService.list(5),
    retry: false,
  });

  return {
    account: dashboardQuery.data?.account,
    dashboardError: dashboardQuery.error,
    isInitialLoading: dashboardQuery.isLoading || analyticsHistoryQuery.isLoading || scoreLatestQuery.isLoading,
    latestInsights: dashboardQuery.data?.latestInsights || insightsQuery.data || [],
    latestScore: scoreLatestQuery.data || dashboardQuery.data?.latestScore,
    latestSnapshot: dashboardQuery.data?.latestSnapshot || analyticsHistoryQuery.data?.[0],
    scoreError: scoreLatestQuery.error,
    scoreHistory: scoreHistoryQuery.data || [],
    scoreHistoryError: scoreHistoryQuery.error,
    snapshotHistory: analyticsHistoryQuery.data || [],
  };
}
