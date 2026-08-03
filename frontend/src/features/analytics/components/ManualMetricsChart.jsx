import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionCard } from "../../../components/ui/SectionCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatNumber } from "../../../utils/formatters";

const metricConfig = [
  {
    key: "followers",
    label: "Followers",
  },
  {
    key: "follows",
    label: "Following",
  },
  {
    key: "mediaCount",
    label: "Posts",
  },
];

function getMetric(account, key) {
  const metric =
    account?.metrics?.[key];

  const value =
    Number(metric?.value);

  return {
    source:
      metric?.source || "unavailable",
    value:
      Number.isFinite(value)
        ? value
        : null,
  };
}

export function ManualMetricsChart({ account }) {
  const data =
    metricConfig.map((metric) => {
      const current =
        getMetric(
          account,
          metric.key
        );

      return {
        name:
          metric.label,
        value:
          current.value ?? 0,
        display:
          current.value === null
            ? "Unavailable"
            : formatNumber(current.value),
        source:
          current.source,
      };
    });

  const hasAnyValue =
    data.some((item) => item.value > 0);

  if (!account?.hasManualMetrics && !hasAnyValue) {
    return null;
  }

  return (
    <SectionCard
      title={account?.hasManualMetrics ? "Manual metrics graph" : "Account metrics graph"}
      description={
        account?.hasManualMetrics
          ? "These bars visualize user-confirmed estimates so the dashboard and Creator Score stay useful when Meta does not return complete metrics."
          : "These bars visualize the account metrics currently available to the frontend."
      }
      action={
        account?.hasManualMetrics ? (
          <StatusBadge variant="warning">Limited estimate mode</StatusBadge>
        ) : (
          <StatusBadge variant="success">Provider data</StatusBadge>
        )
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} width={72} />
            <Tooltip
              formatter={(_, __, item) => [item.payload.display, "Value"]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                borderColor: "var(--app-border)",
                background: "var(--app-paper)",
                color: "var(--app-text)",
              }}
            />
            <Bar dataKey="value" fill="var(--app-primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
            <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{item.name}</p>
            <p className="mt-1 text-lg font-semibold text-[var(--app-text)]">{item.display}</p>
            <p className="mt-1 text-xs text-[var(--app-muted)]">Source: {item.source}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
