import { useEffect, useState } from "react";

// UI Components
import StatsCard from "../components/dashboard/StatsCard.jsx";
import EngagementChart from "../components/dashboard/EngagementChart.jsx";
import PostsChart from "../components/dashboard/PostsChart.jsx";
import AIInsightsCard from "../components/dashboard/AIInsightsCard.jsx";

// Context
import { useAuth } from "../context/AuthContext.jsx";

// Backend Services
import {
  getSocialAccounts,
  getAnalyticsSnapshots,
  syncSocialAccount,
} from "../services/socialAnalyticsService.js";

import { getAIInsights } from "../services/aiService.js";

/**
 * Dashboard Page
 *
 * Responsibilities:
 * - Fetch connected social accounts
 * - Fetch analytics snapshots
 * - Transform data for charts + stats
 * - Sync account data
 * - Generate AI insights
 */
const Dashboard = () => {
  const { token } = useAuth();

  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [dashboardStats, setDashboardStats] = useState([]);
  const [engagementChartData, setEngagementChartData] = useState([]);
  const [postsChartData, setPostsChartData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  // 🔥 AI STATE (IMPORTANT — this was missing earlier)
  const [aiInsights, setAIInsights] = useState("");
  const [aiLoading, setAILoading] = useState(false);

  // ===============================
  // DATA TRANSFORMATION FUNCTION
  // ===============================

  /**
   * Convert backend snapshot data into:
   * - stats cards
   * - engagement chart
   * - posts chart
   */
  const transformSnapshotData = (snapshots) => {
    if (!snapshots || snapshots.length === 0) {
      setDashboardStats([]);
      setEngagementChartData([]);
      setPostsChartData([]);
      return;
    }

    // Latest snapshot for stats
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

    // Chart data
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

  // ===============================
  // LOAD DASHBOARD DATA
  // ===============================

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        // Fetch accounts
        const accountsData = await getSocialAccounts(token);
        const accounts = accountsData.accounts || [];

        setSocialAccounts(accounts);

        if (accounts.length === 0) {
          setSelectedAccount(null);
          return;
        }

        // Select first account by default
        const firstAccount = accounts[0];
        setSelectedAccount(firstAccount);

        // Fetch snapshots
        const snapshotsData = await getAnalyticsSnapshots(
          firstAccount._id,
          token
        );

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

  // ===============================
  // SYNC FUNCTION
  // ===============================

  /**
   * Sync latest data from backend
   */
  const handleSync = async () => {
    if (!selectedAccount || !token) return;

    try {
      setSyncing(true);
      setError("");

      await syncSocialAccount(selectedAccount._id, token);

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

  // ===============================
  // AI INSIGHTS FUNCTION
  // ===============================

  /**
   * Call backend AI API and update UI
   */
  const handleGenerateInsights = async () => {
    if (!selectedAccount || !token) return;

    try {
      setAILoading(true);

      const data = await getAIInsights(selectedAccount._id, token);

      setAIInsights(data.insights);
    } catch (error) {
      console.error("AI Error:", error);
      setAIInsights("Failed to generate insights.");
    } finally {
      setAILoading(false);
    }
  };

  // ===============================
  // UI RENDER
  // ===============================

  return (
    <div>
      {/* HEADER */}
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
            onClick={handleSync}
            disabled={syncing}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* NO ACCOUNT */}
      {!loading && socialAccounts.length === 0 && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-700">
            No Connected Social Account
          </h2>
        </div>
      )}

      {/* STATS */}
      {socialAccounts.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse"></div>
              ))
            : dashboardStats.map((stat) => (
                <StatsCard key={stat.id} {...stat} />
              ))}
        </div>
      )}

      {/* CHARTS */}
      {!loading && engagementChartData.length > 0 && (
        <EngagementChart data={engagementChartData} />
      )}

      {!loading && postsChartData.length > 0 && (
        <PostsChart data={postsChartData} />
      )}

      {/* 🔥 AI INSIGHTS (FINAL FEATURE) */}
      {selectedAccount && (
        <AIInsightsCard
          insights={aiInsights}
          loading={aiLoading}
          onGenerate={handleGenerateInsights}
        />
      )}
    </div>
  );
};

export default Dashboard;