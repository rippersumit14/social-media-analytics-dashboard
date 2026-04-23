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
 * - category-based analytics
 * - charts
 * - AI insights
 */
const Analytics = () => {
  const { token } = useAuth();

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  const [dashboardStats, setDashboardStats] = useState([]);
  const [engagementChartData, setEngagementChartData] = useState([]);
  const [postsChartData, setPostsChartData] = useState([]);
  const [followersChartData, setFollowersChartData] = useState([]);
  const [reelsChartData, setReelsChartData] = useState([]);
  const [repostsChartData, setRepostsChartData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const [aiInsights, setAIInsights] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [remainingUsage, setRemainingUsage] = useState(null);

  // NEW: category selector
  const [activeCategory, setActiveCategory] = useState("engagement");

  const categories = [
    { id: "engagement", label: "Engagement" },
    { id: "followers", label: "Followers" },
    { id: "posts", label: "Posts" },
    { id: "reels", label: "Reels" },
    { id: "reposts", label: "Reposts" },
  ];

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

  /**
   * Transform raw snapshots into UI-ready stats and chart series
   */
  const transformSnapshotData = (allSnapshots) => {
    setSnapshots(allSnapshots || []);

    if (!allSnapshots || allSnapshots.length === 0) {
      setDashboardStats([]);
      setEngagementChartData([]);
      setPostsChartData([]);
      setFollowersChartData([]);
      setReelsChartData([]);
      setRepostsChartData([]);
      return;
    }

    const latest = allSnapshots[allSnapshots.length - 1];

    // Safe fallback fields for upcoming backend expansion
    const latestReelViews = latest.reelViews ?? latest.impressions ?? 0;
    const latestReposts = latest.reposts ?? latest.shares ?? 0;

    const stats = [
      {
        id: 1,
        title: "Followers",
        value: String(latest.followers ?? 0),
        color: "purple",
      },
      {
        id: 2,
        title: "Posts",
        value: String(latest.posts ?? 0),
        color: "blue",
      },
      {
        id: 3,
        title: "Comments",
        value: String(latest.comments ?? 0),
        color: "green",
      },
      {
        id: 4,
        title: "Reel Views",
        value: String(latestReelViews),
        color: "blue",
      },
      {
        id: 5,
        title: "Reposts",
        value: String(latestReposts),
        color: "green",
      },
      {
        id: 6,
        title: "Engagement",
        value: `${latest.engagementRate ?? 0}%`,
        color: "purple",
      },
    ];

    const engagementData = allSnapshots.map((snapshot) => ({
      name: formatChartLabel(snapshot.capturedAt),
      engagement: snapshot.engagementRate ?? 0,
    }));

    const postsData = allSnapshots.map((snapshot) => ({
      name: formatChartLabel(snapshot.capturedAt),
      posts: snapshot.posts ?? 0,
    }));

    const followersData = allSnapshots.map((snapshot) => ({
      name: formatChartLabel(snapshot.capturedAt),
      followers: snapshot.followers ?? 0,
    }));

    const reelsData = allSnapshots.map((snapshot) => ({
      name: formatChartLabel(snapshot.capturedAt),
      engagement: snapshot.reelViews ?? snapshot.impressions ?? 0,
    }));

    const repostsData = allSnapshots.map((snapshot) => ({
      name: formatChartLabel(snapshot.capturedAt),
      posts: snapshot.reposts ?? snapshot.shares ?? 0,
    }));

    setDashboardStats(stats);
    setEngagementChartData(engagementData);
    setPostsChartData(postsData);
    setFollowersChartData(followersData);
    setReelsChartData(reelsData);
    setRepostsChartData(repostsData);
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
          transformSnapshotData([]);
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

      const snapshotsData = await getAnalyticsSnapshots(selectedAccount._id, token);
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

      // reset AI when switching account
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

  // Category-specific stat groups
  const getCategoryStats = () => {
    const latest = snapshots[snapshots.length - 1] || {};

    switch (activeCategory) {
      case "followers":
        return [
          {
            id: 1,
            title: "Followers",
            value: String(latest.followers ?? 0),
            color: "purple",
          },
          {
            id: 2,
            title: "Following",
            value: String(latest.following ?? 0),
            color: "blue",
          },
        ];

      case "posts":
        return [
          {
            id: 1,
            title: "Posts",
            value: String(latest.posts ?? 0),
            color: "blue",
          },
          {
            id: 2,
            title: "Comments",
            value: String(latest.comments ?? 0),
            color: "green",
          },
          {
            id: 3,
            title: "Likes",
            value: String(latest.likes ?? 0),
            color: "purple",
          },
        ];

      case "reels":
        return [
          {
            id: 1,
            title: "Reel Views",
            value: String(latest.reelViews ?? latest.impressions ?? 0),
            color: "blue",
          },
          {
            id: 2,
            title: "Reach",
            value: String(latest.reach ?? 0),
            color: "green",
          },
          {
            id: 3,
            title: "Impressions",
            value: String(latest.impressions ?? 0),
            color: "purple",
          },
        ];

      case "reposts":
        return [
          {
            id: 1,
            title: "Reposts",
            value: String(latest.reposts ?? latest.shares ?? 0),
            color: "green",
          },
          {
            id: 2,
            title: "Comments",
            value: String(latest.comments ?? 0),
            color: "blue",
          },
        ];

      case "engagement":
      default:
        return [
          {
            id: 1,
            title: "Engagement",
            value: `${latest.engagementRate ?? 0}%`,
            color: "green",
          },
          {
            id: 2,
            title: "Likes",
            value: String(latest.likes ?? 0),
            color: "blue",
          },
          {
            id: 3,
            title: "Comments",
            value: String(latest.comments ?? 0),
            color: "purple",
          },
        ];
    }
  };

  const renderCategoryChart = () => {
    switch (activeCategory) {
      case "followers":
        return <EngagementChart data={followersChartData} />;

      case "posts":
        return <PostsChart data={postsChartData} />;

      case "reels":
        return <EngagementChart data={reelsChartData} />;

      case "reposts":
        return <PostsChart data={repostsChartData} />;

      case "engagement":
      default:
        return <EngagementChart data={engagementChartData} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="mt-3 text-gray-600">
            Explore category-wise metrics, charts, and AI-powered insights.
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

      {/* Account selector */}
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

      {/* Category selector */}
      {selectedAccount && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">
            Analytics Categories
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category stats */}
      {selectedAccount && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-gray-200"
                ></div>
              ))
            : getCategoryStats().map((stat) => (
                <StatsCard key={stat.id} {...stat} />
              ))}
        </div>
      )}

      {/* Category chart */}
      {!loading && selectedAccount && (
        <div className="mt-6">{renderCategoryChart()}</div>
      )}

      {/* AI insights */}
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