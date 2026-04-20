import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

//Post Chart Component
//Displays number of posts across days using a bar chart 

const PostsChart = ({ data }) => {
  return (
    <div className="mt-10 rounded-lg bg-white p-5 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">
        Posts Overview
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* X-axis for days */}
          <XAxis dataKey="name" />

          {/* Y-axis for number of posts */}
          <YAxis />

          {/* Tooltip on hover */}
          <Tooltip />

          {/* Bars */}
          <Bar dataKey="posts" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PostsChart;