import { AlertTriangle } from "lucide-react";

const priorityStyles = {
  critical: "border-red-500/30 bg-red-500/10 text-red-700",
  high: "border-amber-500/35 bg-amber-500/10 text-amber-700",
  medium: "border-blue-500/30 bg-blue-500/10 text-[var(--app-primary)]",
  low: "border-teal-500/30 bg-teal-500/10 text-teal-700",
};

function formatPriority(priority) {
  if (!priority) {
    return "Priority unknown";
  }

  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function PriorityBadge({ priority }) {
  const normalizedPriority = String(priority || "").toLowerCase();
  const className = priorityStyles[normalizedPriority] || "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)]";

  return (
    <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", className].join(" ")}>
      <AlertTriangle aria-hidden="true" size={13} />
      {formatPriority(normalizedPriority)}
    </span>
  );
}
