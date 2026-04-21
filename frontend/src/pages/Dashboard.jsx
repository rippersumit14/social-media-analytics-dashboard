import { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import EngagementChart from "../components/dashboard/EngagementChart.jsx";
import PostsChart from "../components/dashboard/PostsChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getSocialAccounts,
  getAnalyticsSnapshots,
  syncSocialAccount,
} from "../services/socialAnalyticsService.js";

/**
 * Dashboard page
 * Fetches real backend data:
 * - connected social accounts
 * - analytics snapshots
 * Then transforms that data into stats cards and charts
 */
const Dashboard = () => {
  const { token } = useAuth();

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [engagementChartData, setEngagementChartData] = useState([]);
  const [postsChartData, setPostsChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  /**
   * Convert backend snapshot history into dashboard UI data
   */
  const transformSnapshotData = (snapshots) => {
    if (!snapshots || snapshots.length === 0) {
      setDashboardStats([]);
      setEngagementChartData([]);
      setPostsChartData([]);
      return;
    }

    const latestSnapshot = snapshots[snapshots.length - 1];

    const stats = [
      {
        id: 1,
        title: "Total Posts",
        value: latestSnapshot.posts?.toString() || "0",
        color: "blue",
      },
      {
        id: 2,
        title: "Engagement",
        value: `${latestSnapshot.engagementRate ?? 0}%`,
        color: "green",
      },
      {
        id: 3,
        title: "Followers",
        value: latestSnapshot.followers?.toString() || "0",
        color: "purple",
      },
    ];

    const engagementData = snapshots.map((snapshot) => ({
      name: new Date(snapshot.capturedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      engagement: snapshot.engagementRate,
    }));

    const postsData = snapshots.map((snapshot) => ({
      name: new Date(snapshot.capturedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      posts: snapshot.posts,
    }));

    setDashboardStats(stats);
    setEngagementChartData(engagementData);
    setPostsChartData(postsData);
  };

  /**
   * Load connected social accounts and snapshot history
   */
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const accountsData = await getSocialAccounts(token);
        const accounts = accountsData.accounts || [];

        setSocialAccounts(accounts);

        if (accounts.length === 0) {
          setSelectedAccount(null);
          setDashboardStats([]);
          setEngagementChartData([]);
          setPostsChartData([]);
          return;
        }

        const firstAccount = accounts[0];
        setSelectedAccount(firstAccount);

        const snapshotsData = await getAnalyticsSnapshots(firstAccount._id, token);
        transformSnapshotData(snapshotsData.snapshots || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  /**
   * Trigger sync and refresh snapshot data
   */
  const handleSync = async () => {
    if (!selectedAccount || !token) return;

    try {
      setSyncing(true);
      setError("");

      await syncSocialAccount(selectedAccount._id, token);

      const snapshotsData = await getAnalyticsSnapshots(selectedAccount._id, token);
      transformSnapshotData(snapshotsData.snapshots || []);
    } catch (err) {
      console.error("Sync error:", err);
      setError("Failed to sync account data");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>

          <p className="mt-3 text-gray-600">
            View your real social analytics and performance trends.
          </p>
        </div>

        {selectedAccount && (
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        )}
      </div>

      {/* Error UI */}
      {error && (
        <div className="mt-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No connected account */}
      {!loading && socialAccounts.length === 0 && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-700">
            No Connected Social Account
          </h2>
          <p className="mt-2 text-gray-600">
            Connect a social account first to start tracking analytics.
          </p>
        </div>
      )}

      {/* Stats cards */}
      {socialAccounts.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-lg bg-gray-200"
                ></div>
              ))
            : dashboardStats.map((stat) => (
                <StatsCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                />
              ))}
        </div>
      )}

      {/* Charts */}
      {!loading && engagementChartData.length > 0 && (
        <EngagementChart data={engagementChartData} />
      )}

      {!loading && postsChartData.length > 0 && (
        <PostsChart data={postsChartData} />
      )}
    </div>
  );
};

export default Dashboard;