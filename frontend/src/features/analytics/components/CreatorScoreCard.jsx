import { Link } from "react-router-dom";
import { Gauge } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { routePaths } from "../../../routes/routePaths";
import { formatDateTime } from "../../../utils/formatters";
import { ScoreBreakdown } from "./ScoreBreakdown";

function getScoreLabel(score) {
  if (score >= 85) {
    return { label: "Excellent", variant: "success" };
  }

  if (score >= 70) {
    return { label: "Strong", variant: "success" };
  }

  if (score >= 45) {
    return { label: "Growing", variant: "warning" };
  }

  return { label: "Low", variant: "neutral" };
}

export function CreatorScoreCard({ score, compact = false }) {
  const totalScore = Number(score?.totalScore || 0);
  const scoreMeta = getScoreLabel(totalScore);
  const ringStyle = {
    background: `conic-gradient(#2563eb ${totalScore * 3.6}deg, #eceff4 0deg)`,
  };

  return (
    <SectionCard
      title="Creator Score"
      description="A weighted score across engagement, growth, consistency, and activity."
      action={<StatusBadge variant={scoreMeta.variant}>{scoreMeta.label}</StatusBadge>}
    >
      {score ? (
        <div className={compact ? "space-y-5" : "grid gap-6 lg:grid-cols-[auto_1fr]"}>
          <div className="flex items-center gap-5">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2" style={ringStyle}>
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-4xl font-semibold text-ink-950">{Math.round(totalScore)}</p>
                  <p className="text-xs font-semibold uppercase text-ink-500">out of 100</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-950">Latest calculation</p>
              <p className="mt-1 text-sm text-ink-500">{formatDateTime(score.calculatedAt || score.createdAt)}</p>
              {!compact ? (
                <Button as={Link} to={routePaths.creatorScore} variant="secondary" className="mt-4">
                  <Gauge aria-hidden="true" size={18} />
                  Open score page
                </Button>
              ) : null}
            </div>
          </div>
          <ScoreBreakdown score={score} />
        </div>
      ) : (
        <EmptyState
          title="No creator score yet"
          description="Generate a score after media sync and analytics snapshots are available."
        />
      )}
    </SectionCard>
  );
}
