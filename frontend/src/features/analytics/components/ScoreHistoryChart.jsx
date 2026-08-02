import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionCard } from "../../../components/ui/SectionCard";

function formatChartDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function ScoreHistoryChart({ history }) {
  const chartData = [...(history || [])]
    .reverse()
    .map((item) => ({
      date: item.calculatedAt || item.createdAt,
      score: Number(item.totalScore || 0),
    }))
    .filter((item) => item.date);

  return (
    <SectionCard title="Score history" description="Trend line from recent creator score calculations.">
      {chartData.length > 1 ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -24, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid stroke="#eceff4" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatChartDate} tickLine={false} axisLine={false} fontSize={12} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip labelFormatter={formatChartDate} formatter={(value) => [`${value}/100`, "Score"]} />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          title="Not enough score history yet"
          description="Generate more snapshots and score calculations to see creator score trends."
        />
      )}
    </SectionCard>
  );
}
