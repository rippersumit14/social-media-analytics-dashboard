const scoreRows = [
  { key: "engagementScore", label: "Engagement", max: 40 },
  { key: "growthScore", label: "Growth", max: 20 },
  { key: "consistencyScore", label: "Consistency", max: 20 },
  { key: "activityScore", label: "Activity", max: 20 },
];

export function ScoreBreakdown({ score }) {
  return (
    <div className="space-y-4">
      {scoreRows.map((row) => {
        const value = Number(score?.[row.key] || 0);
        const percent = Math.min(100, Math.max(0, (value / row.max) * 100));

        return (
          <div key={row.key}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink-700">{row.label}</span>
              <span className="font-semibold text-ink-950">
                {value}/{row.max}
              </span>
            </div>
            <div className="h-2 rounded-full bg-cloud-100">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
