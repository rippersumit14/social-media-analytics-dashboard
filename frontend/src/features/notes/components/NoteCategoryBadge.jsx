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
    <span className="inline-flex items-center rounded-full border border-line-200 bg-cloud-50 px-2.5 py-1 text-xs font-semibold text-ink-700">
      {formatCategory(category)}
    </span>
  );
}
