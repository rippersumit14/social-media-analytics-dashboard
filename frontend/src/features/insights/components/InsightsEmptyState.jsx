import { Link } from "react-router-dom";
import { BarChart3, Camera } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { routePaths } from "../../../routes/routePaths";

export function InsightsEmptyState({ type = "empty", onGenerate, isGenerating }) {
  if (type === "no-account") {
    return (
      <EmptyState
        title="Connect Instagram to generate insights"
        description="Creator insights are generated from your active Instagram account, analytics snapshots, score data, and synced media."
        action={
          <Button as={Link} to={routePaths.instagram} variant="secondary">
            <Camera aria-hidden="true" size={18} />
            Open Instagram setup
          </Button>
        }
      />
    );
  }

  if (type === "no-results") {
    return (
      <EmptyState
        title="No insights match your filters"
        description="Try a different search term or priority filter."
      />
    );
  }

  return (
    <EmptyState
      title="No insights yet"
      description="Generate insights from your latest analytics to receive focused recommendations."
      action={
        <Button type="button" variant="secondary" onClick={onGenerate} disabled={isGenerating}>
          <BarChart3 aria-hidden="true" size={18} />
          {isGenerating ? "Generating..." : "Generate from analytics"}
        </Button>
      }
    />
  );
}
