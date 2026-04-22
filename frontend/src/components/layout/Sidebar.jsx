import { Link } from "react-router-dom";

/**
 * Sidebar navigation for dashboard pages.
 */
const Sidebar = () => {
  return (
    <aside className="min-h-screen w-64 bg-gray-900 p-5 text-white">
      <h2 className="mb-8 text-2xl font-bold">Dashboard</h2>

      <nav className="space-y-4">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className="block rounded px-2 py-1 hover:bg-gray-800"
        >
          Dashboard
        </Link>

        {/* Analytics */}
        <Link
          to="/analytics"
          className="block rounded px-2 py-1 hover:bg-gray-800"
        >
          Analytics
        </Link>

        {/*  AI Chat (NEW) */}
        <Link
          to="/ai-chat"
          className="block rounded px-2 py-1 hover:bg-gray-800"
        >
          AI Chat
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;