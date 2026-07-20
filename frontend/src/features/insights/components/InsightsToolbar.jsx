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
    <div className="rounded-lg border border-line-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="sr-only">Search insights</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-line-200 bg-cloud-50 pl-10 pr-3 text-sm text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-600 focus:ring-4 focus:ring-blue-100"
            placeholder="Search title, type, description, or recommendation"
          />
        </label>
        <label>
          <span className="sr-only">Filter by priority</span>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-line-200 bg-cloud-50 px-3 text-sm font-semibold text-ink-700 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-blue-100"
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
