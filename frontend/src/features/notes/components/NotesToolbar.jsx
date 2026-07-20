import { Search } from "lucide-react";

const views = [
  { label: "Active", value: "active" },
  { label: "Pinned", value: "pinned" },
  { label: "Archived", value: "archived" },
];

export function NotesToolbar({ search, view, sort, onSearchChange, onViewChange, onSortChange }) {
  return (
    <div className="rounded-lg border border-line-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto_180px]">
        <label className="relative block">
          <span className="sr-only">Search notes</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-line-200 bg-cloud-50 pl-10 pr-3 text-sm text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-600 focus:ring-4 focus:ring-blue-100"
            placeholder="Search title, content, or category"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Notes filters">
          {views.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onViewChange(item.value)}
              className={[
                "h-11 rounded-lg border px-4 text-sm font-semibold transition",
                view === item.value ? "border-brand-600 bg-blue-50 text-brand-700" : "border-line-200 bg-white text-ink-700 hover:bg-cloud-50",
              ].join(" ")}
              role="tab"
              aria-selected={view === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label>
          <span className="sr-only">Sort notes</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-line-200 bg-cloud-50 px-3 text-sm font-semibold text-ink-700 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>
    </div>
  );
}
