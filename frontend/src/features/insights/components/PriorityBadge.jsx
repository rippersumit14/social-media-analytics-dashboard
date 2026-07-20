import { AlertTriangle } from "lucide-react";

const priorityStyles = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-blue-200 bg-blue-50 text-brand-700",
  low: "border-teal-200 bg-teal-50 text-teal-700",
};

function formatPriority(priority) {
  if (!priority) {
    return "Priority unknown";
  }

  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function PriorityBadge({ priority }) {
  const normalizedPriority = String(priority || "").toLowerCase();
  const className = priorityStyles[normalizedPriority] || "border-line-200 bg-cloud-50 text-ink-700";

  return (
    <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", className].join(" ")}>
      <AlertTriangle aria-hidden="true" size={13} />
      {formatPriority(normalizedPriority)}
    </span>
  );
}
