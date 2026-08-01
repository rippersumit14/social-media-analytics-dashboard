function formatCategory(category) {
  const value = String(category || "general").trim();

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function NoteCategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--app-muted)]">
      {formatCategory(category)}
    </span>
  );
}
