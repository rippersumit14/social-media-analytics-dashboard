import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { BarChart3, Bot, BrainCircuit, ClipboardList, Gauge, NotebookPen } from "lucide-react";

import { routePaths } from "../../routes/routePaths";

const benefits = [
  {
    title: "Analytics",
    description: "Review available account metrics, media information, and historical snapshots.",
    icon: BarChart3,
    to: routePaths.analytics,
  },
  {
    title: "Creator Score",
    description: "Calculate an overall creator-health score using available performance signals.",
    icon: Gauge,
    to: routePaths.creatorScore,
  },
  {
    title: "Creator Insights",
    description: "Generate prioritized observations based on synchronized creator information.",
    icon: BrainCircuit,
    to: routePaths.insights,
  },
  {
    title: "AI Growth Assistant",
    description: "Ask more context-aware questions using available account and analytics data.",
    icon: Bot,
    to: routePaths.chat,
  },
  {
    title: "Recommendations",
    description: "Turn insights into practical content and consistency actions.",
    icon: ClipboardList,
    to: routePaths.dashboard,
  },
  {
    title: "Personal Notes",
    description: "Save observations, priorities, and experiments alongside creator data.",
    icon: NotebookPen,
    to: routePaths.notes,
  },
];

export function InstagramBenefitsGrid({ isConnected, onConnectFirst }) {
  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">What connection unlocks</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
          Instagram data makes these product areas more useful while preserving workflows that already work without Instagram, such as personal notes.
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="flex h-full flex-col rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4">
            <benefit.icon aria-hidden="true" className="text-[var(--app-primary)]" size={22} />
            <h3 className="mt-4 text-base font-semibold text-[var(--app-text)]">{benefit.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-[var(--app-muted)]">{benefit.description}</p>
            {isConnected || benefit.to === routePaths.notes ? (
              <Button component={Link} to={benefit.to} variant="text" sx={{ mt: 2, justifyContent: "flex-start" }}>
                Open
              </Button>
            ) : (
              <Button type="button" variant="text" sx={{ mt: 2, justifyContent: "flex-start" }} onClick={onConnectFirst}>
                Connect Instagram first
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
