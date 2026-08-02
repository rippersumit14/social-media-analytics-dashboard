import { Search } from "lucide-react";

const priorityOptions = [
  { label: "All priorities", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export function InsightsToolbar({ search, priority, onSearchChange, onPriorityChange }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-4 shadow-sm shadow-black/5">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="sr-only">Search insights</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)]" size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] pl-10 pr-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]"
            placeholder="Search title, type, description, or recommendation"
          />
        </label>
        <label>
          <span className="sr-only">Filter by priority</span>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-sm font-semibold text-[var(--app-text)] outline-none transition focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
