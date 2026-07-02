export function formatNumber(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en", {
    notation: number >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatPercent(value) {
  const number = Number(value || 0);

  return `${number.toFixed(number % 1 === 0 ? 0 : 1)}%`;
}

export function formatDateTime(value) {
  if (!value) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
