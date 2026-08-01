import { Search } from "lucide-react";

const views = [
  { label: "Active", value: "active" },
  { label: "Pinned", value: "pinned" },
  { label: "Archived", value: "archived" },
];

export function NotesToolbar({ search, view, sort, onSearchChange, onViewChange, onSortChange }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-4 shadow-sm shadow-black/5">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto_180px]">
        <label className="relative block">
          <span className="sr-only">Search notes</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)]" size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] pl-10 pr-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]"
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
                view === item.value ? "border-[var(--app-primary)] bg-[var(--app-bg)] text-[var(--app-primary)]" : "border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-text)] hover:bg-[var(--app-bg)]",
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
            className="h-11 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-sm font-semibold text-[var(--app-text)] outline-none transition focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>
    </div>
  );
}
