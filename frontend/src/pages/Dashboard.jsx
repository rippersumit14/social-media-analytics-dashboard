/**
 * Dashboard home page.
 */
const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
      <p className="mt-3 text-gray-600">
        Welcome to your Social Media Analytics Dashboard.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Posts</h2>
          <p className="mt-2 text-2xl font-bold text-blue-600">128</p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-gray-700">Engagement</h2>
          <p className="mt-2 text-2xl font-bold text-green-600">84%</p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-gray-700">Followers Growth</h2>
          <p className="mt-2 text-2xl font-bold text-purple-600">+12.4%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;