export function getMetricSourceLabel(source) {
  if (source === "meta") return "Meta";
  if (source === "manual") return "Manual estimate";
  return "Unavailable";
}

export function hasUnavailableMetrics(account) {
  const metrics = account?.metrics || {};

  return ["followers", "follows", "mediaCount"].some(
    (key) => metrics[key]?.source === "unavailable",
  );
}

export function hasManualMetrics(account) {
  const metrics = account?.metrics || {};

  return Object.values(metrics).some((metric) => metric?.source === "manual");
}
