import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BarChart3, BrainCircuit, Gauge, RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { SectionCard } from "../../../components/ui/SectionCard";
import { analyticsService } from "../../../services/analyticsService";
import { creatorScoreService } from "../../../services/creatorScoreService";
import { insightsService } from "../../../services/insightsService";
import { instagramService } from "../../../services/instagramService";
import { getApiErrorMessage } from "../../../utils/apiError";

export function AnalyticsActionPanel({ hasAccount }) {
  const queryClient = useQueryClient();

  function refreshAnalyticsQueries() {
    queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["creator-score"] });
    queryClient.invalidateQueries({ queryKey: ["creator-insights"] });
  }

  const syncMedia = useMutation({
    mutationFn: instagramService.syncMedia,
    onSuccess: () => {
      toast.success("Media sync started successfully.");
      refreshAnalyticsQueries();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Action failed. Please try again."));
    },
  });

  const createSnapshot = useMutation({
    mutationFn: analyticsService.createSnapshot,
    onSuccess: () => {
      toast.success("Analytics snapshot generated.");
      refreshAnalyticsQueries();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Action failed. Please try again."));
    },
  });

  const calculateScore = useMutation({
    mutationFn: creatorScoreService.calculate,
    onSuccess: () => {
      toast.success("Creator score calculated.");
      refreshAnalyticsQueries();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Action failed. Please try again."));
    },
  });

  const generateInsights = useMutation({
    mutationFn: insightsService.generate,
    onSuccess: () => {
      toast.success("Insights generated.");
      refreshAnalyticsQueries();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Action failed. Please try again."));
    },
  });

  const actions = [
    { label: "Sync Media", icon: RefreshCw, mutation: syncMedia },
    { label: "Generate Snapshot", icon: BarChart3, mutation: createSnapshot },
    { label: "Calculate Creator Score", icon: Gauge, mutation: calculateScore },
    { label: "Generate Insights", icon: BrainCircuit, mutation: generateInsights },
  ];

  return (
    <SectionCard title="Analytics actions" description="Run the core analytics pipeline manually when you want fresh data.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="secondary"
            className="w-full justify-start"
            onClick={() => action.mutation.mutate()}
            disabled={!hasAccount || action.mutation.isPending}
          >
            <action.icon aria-hidden="true" size={18} />
            {action.mutation.isPending ? "Working..." : action.label}
          </Button>
        ))}
      </div>
      {!hasAccount ? <p className="mt-4 text-sm text-ink-500">Connect Instagram before running analytics actions.</p> : null}
    </SectionCard>
  );
}
