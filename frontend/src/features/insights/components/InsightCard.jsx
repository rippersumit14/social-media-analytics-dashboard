import { ArrowRight, Clock, Lightbulb, Sparkles } from "lucide-react";

import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDateTime } from "../../../utils/formatters";
import { PriorityBadge } from "./PriorityBadge";

function formatLabel(value, fallback = "General") {
  if (!value) {
    return fallback;
  }

  return String(value)
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function InsightCard({ insight }) {
  return (
    <article className="rounded-lg border border-line-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-700">
            <Sparkles aria-hidden="true" size={19} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{formatLabel(insight.type, "Insight")}</StatusBadge>
              {insight.source ? <StatusBadge variant="neutral">{formatLabel(insight.source, "System")}</StatusBadge> : null}
            </div>
            <h2 className="mt-3 text-base font-semibold text-ink-950">{insight.title || "Untitled insight"}</h2>
          </div>
        </div>
        <PriorityBadge priority={insight.priority} />
      </div>

      <p className="mt-4 text-sm leading-6 text-ink-700">{insight.description || "No description provided."}</p>

      {insight.recommendation ? (
        <div className="mt-4 rounded-lg border border-line-200 bg-cloud-50 p-4">
          <div className="flex items-start gap-2">
            <Lightbulb aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500" size={17} />
            <div>
              <p className="text-xs font-semibold uppercase text-ink-500">Recommended next step</p>
              <p className="mt-1 text-sm leading-6 text-ink-700">{insight.recommendation}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden="true" size={14} />
          Generated {formatDateTime(insight.generatedAt || insight.createdAt)}
        </span>
        {insight.updatedAt ? (
          <span className="inline-flex items-center gap-1">
            <ArrowRight aria-hidden="true" size={14} />
            Updated {formatDateTime(insight.updatedAt)}
          </span>
        ) : null}
      </div>
    </article>
  );
}
