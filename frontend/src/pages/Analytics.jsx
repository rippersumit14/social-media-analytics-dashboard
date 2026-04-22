import { useEffect, useState } from "react";

// UI Components
import StatsCard from "../components/dashboard/StatsCard.jsx";
import EngagementChart from "../components/dashboard/EngagementChart.jsx";
import PostsChart from "../components/dashboard/PostsChart.jsx";
import AIInsightsCard from "../components/dashboard/AIInsightsCard.jsx";

// Context
import { useAuth } from "../context/AuthContext.jsx";

// Services
import {
  getSocialAccounts,
  getAnalyticsSnapshots,
  syncSocialAccount,
} from "../services/socialAnalyticsService.js";
import { getAIInsights } from "../services/aiService.js";

/**
 * Analytics page
 * Purpose:
 * - account selector
 * - sync
 * - detailed stats
 * - charts
 * - AI insights
 */
const Analytics = () => {
  const { token } = useAuth();

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [dashboardStats, setDashboardStats] = useState([]);
  const [engagementChartData, setEngagementChartData] = useState([]);
  const [postsChartData, setPostsChartData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  // AI state
  const [aiInsights, setAIInsights] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [remainingUsage, setRemainingUsage] = useState(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never synced";

    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatChartLabel = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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
      name: formatChartLabel(snapshot.capturedAt),
      engagement: snapshot.engagementRate,
    }));

    const postsData = snapshots.map((snapshot) => ({
      name: formatChartLabel(snapshot.capturedAt),
      posts: snapshot.posts,
    }));

    setDashboardStats(stats);
    setEngagementChartData(engagementData);
    setPostsChartData(postsData);
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
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
        console.error("Analytics load error:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [token]);

  const handleSync = async () => {
    if (!selectedAccount || !token) return;

    try {
      setSyncing(true);
      setError("");

      const syncData = await syncSocialAccount(selectedAccount._id, token);

      if (syncData.socialAccount) {
        setSelectedAccount(syncData.socialAccount);
      }

      const snapshotsData = await getAnalyticsSnapshots(
        selectedAccount._id,
        token
      );

      transformSnapshotData(snapshotsData.snapshots || []);
    } catch (err) {
      console.error("Sync error:", err);
      setError("Failed to sync account data");
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!selectedAccount || !token) return;

    try {
      setAILoading(true);
      setError("");

      const data = await getAIInsights(selectedAccount._id, token);

      setAIInsights(data.insights);
      setRemainingUsage(data.remainingUsage ?? null);
    } catch (error) {
      console.error("AI Error:", error);
      setAIInsights("Failed to generate insights.");
      setError(
        error.response?.data?.message || "Failed to generate AI insights"
      );
    } finally {
      setAILoading(false);
    }
  };

  const handleAccountChange = async (e) => {
    const accountId = e.target.value;

    const account = socialAccounts.find((item) => item._id === accountId);

    if (!account || !token) return;

    try {
      setLoading(true);
      setError("");
      setSelectedAccount(account);

      // reset AI data when switching accounts
      setAIInsights("");
      setRemainingUsage(null);

      const snapshotsData = await getAnalyticsSnapshots(account._id, token);
      transformSnapshotData(snapshotsData.snapshots || []);
    } catch (err) {
      console.error("Account switch error:", err);
      setError("Failed to load selected account data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="mt-3 text-gray-600">
            Explore detailed charts, metrics, sync activity, and AI analysis.
          </p>
        </div>

        {selectedAccount && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No account */}
      {!loading && socialAccounts.length === 0 && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-700">
            No Connected Social Account
          </h2>
          <p className="mt-2 text-gray-600">
            Connect a social account first to view analytics.
          </p>
        </div>
      )}

      {/* Account selector + info */}
      {selectedAccount && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Connected Account
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Switch between your connected accounts
              </p>
            </div>

            <div className="w-full md:w-72">
              <label className="mb-1 block text-sm text-gray-600">
                Select Account
              </label>

              <select
                value={selectedAccount._id}
                onChange={handleAccountChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 outline-none focus:border-blue-500"
              >
                {socialAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    @{account.username} ({account.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-800">
                @{selectedAccount.username}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Platform</p>
              <p className="font-medium capitalize text-gray-800">
                {selectedAccount.platform}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Last Synced</p>
              <p className="font-medium text-gray-800">
                {formatDateTime(selectedAccount.lastSyncedAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {socialAccounts.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-gray-200"
                ></div>
              ))
            : dashboardStats.map((stat) => (
                <StatsCard key={stat.id} {...stat} />
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

      {/* AI Insights */}
      {selectedAccount && (
        <AIInsightsCard
          insights={aiInsights}
          loading={aiLoading}
          onGenerate={handleGenerateInsights}
          remainingUsage={remainingUsage}
        />
      )}
    </div>
  );
};

export default Analytics;