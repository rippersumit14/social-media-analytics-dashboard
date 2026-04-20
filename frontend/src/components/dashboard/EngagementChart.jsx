import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * Engagement Chart Component
 * Displays engagement over time using a line chart
 */
const EngagementChart = ({ data }) => {
  return (
    <div className="mt-10 rounded-lg bg-white p-5 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">
        Engagement Overview
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* X-axis (time) */}
          <XAxis dataKey="name" />

          {/* Y-axis (values) */}
          <YAxis />

          {/* Tooltip on hover */}
          <Tooltip />

          {/* Line graph */}
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagementChart;