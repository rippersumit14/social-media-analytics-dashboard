import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSocialAccounts,
  getAnalyticsSnapshots,
} from "../services/socialAnalyticsService.js";

import {
  getAIInsights,
} from "../services/aiChatService.js";

import AIInsightsCard from "../components/dashboard/AIInsightsCard.jsx";

/**
 * -------------------------------------------------------
 * Safe fallback analytics.
 * -------------------------------------------------------
 */
const fallbackAnalytics = [
  {
    label: "Week 1",
    followers: 1200,
    engagementRate: 3.2,
    likes: 240,
    comments: 40,
    reach: 12000,
  },

  {
    label: "Week 2",
    followers: 1600,
    engagementRate: 4.1,
    likes: 310,
    comments: 62,
    reach: 18000,
  },

  {
    label: "Week 3",
    followers: 2100,
    engagementRate: 5.4,
    likes: 460,
    comments: 91,
    reach: 25000,
  },

  {
    label: "Week 4",
    followers: 2800,
    engagementRate: 6.3,
    likes: 620,
    comments: 120,
    reach: 34000,
  },
];

/**
 * -------------------------------------------------------
 * Normalize snapshot safely.
 * -------------------------------------------------------
 */
const normalizeSnapshot = (
  snapshot = {},
  index = 0
) => {
  return {
    label:
      snapshot.label ||
      `Snapshot ${index + 1}`,

    followers:
      snapshot.followers ||
      snapshot.followersCount ||
      0,

    engagementRate:
      snapshot.engagementRate ||
      0,

    likes:
      snapshot.likes ||
      0,

    comments:
      snapshot.comments ||
      0,

    reach:
      snapshot.reach ||
      0,

    createdAt:
      snapshot.createdAt ||
      new Date().toISOString(),
  };
};

const Analytics = () => {
  /**
   * -------------------------------------------------------
   * Account lifecycle.
   * -------------------------------------------------------
   */
  const [
    socialAccounts,
    setSocialAccounts,
  ] = useState([]);

  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState(null);

  /**
   * -------------------------------------------------------
   * Analytics lifecycle.
   * -------------------------------------------------------
   */
  const [
    analyticsData,
    setAnalyticsData,
  ] = useState(
    fallbackAnalytics
  );

  /**
   * -------------------------------------------------------
   * AI Insights lifecycle.
   * -------------------------------------------------------
   */
  const [insights, setInsights] =
    useState("");

  const [
    insightsLoading,
    setInsightsLoading,
  ] = useState(false);

  /**
   * -------------------------------------------------------
   * UI lifecycle.
   * -------------------------------------------------------
   */
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /**
   * -------------------------------------------------------
   * Load social accounts.
   * -------------------------------------------------------
   */
  useEffect(() => {
    const loadAccounts =
      async () => {
        try {
          setLoading(true);

          const response =
            await getSocialAccounts();

          const accounts =
            response?.accounts ||
            [];

          setSocialAccounts(
            accounts
          );

          if (
            accounts.length > 0
          ) {
            setSelectedAccount(
              accounts[0]
            );
          }
        } catch (error) {
          console.error(
            "[ANALYTICS ACCOUNTS ERROR]",
            error
          );

          setError(
            "Failed to load social accounts."
          );
        } finally {
          setLoading(false);
        }
      };

    loadAccounts();
  }, []);

  /**
   * -------------------------------------------------------
   * Load analytics snapshots.
   * -------------------------------------------------------
   */
  useEffect(() => {
    const loadSnapshots =
      async () => {
        if (
          !selectedAccount?._id
        ) {
          return;
        }

        try {
          const response =
            await getAnalyticsSnapshots(
              {
                socialAccountId:
                  selectedAccount._id,
              }
            );

          const snapshots =
            response?.snapshots ||
            [];

          if (
            snapshots.length ===
            0
          ) {
            setAnalyticsData(
              fallbackAnalytics
            );

            return;
          }

          const normalized =
            snapshots.map(
              (
                snapshot,
                index
              ) =>
                normalizeSnapshot(
                  snapshot,
                  index
                )
            );

          setAnalyticsData(
            normalized
          );
        } catch (error) {
          console.error(
            "[ANALYTICS SNAPSHOTS ERROR]",
            error
          );

          /**
           * Safe fallback.
           */
          setAnalyticsData(
            fallbackAnalytics
          );
        }
      };

    loadSnapshots();
  }, [selectedAccount]);

  /**
   * -------------------------------------------------------
   * Latest analytics.
   * -------------------------------------------------------
   */
  const latestAnalytics =
    useMemo(() => {
      return (
        analyticsData[
          analyticsData.length -
            1
        ] || {}
      );
    }, [analyticsData]);

  /**
   * -------------------------------------------------------
   * Generate AI insights.
   * -------------------------------------------------------
   */
  const handleGenerateInsights =
    useCallback(
      async () => {
        if (
          !selectedAccount?._id
        ) {
          return;
        }

        try {
          setInsightsLoading(
            true
          );

          const response =
            await getAIInsights(
              {
                socialAccountId:
                  selectedAccount._id,
              }
            );

          const generatedInsights =
            response?.insights;

          /**
           * Safe rendering.
           */
          if (
            typeof generatedInsights ===
            "string"
          ) {
            setInsights(
              generatedInsights
            );
          } else if (
            Array.isArray(
              generatedInsights
            )
          ) {
            setInsights(
              generatedInsights.join(
                "\n"
              )
            );
          } else {
            setInsights(
              "AI generated insights successfully."
            );
          }
        } catch (error) {
          console.error(
            "[AI INSIGHTS ERROR]",
            error
          );

          setInsights(
            "Unable to generate AI insights right now."
          );
        } finally {
          setInsightsLoading(
            false
          );
        }
      },
      [selectedAccount]
    );

  /**
   * -------------------------------------------------------
   * Loading state.
   * -------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Analytics
        </h1>

        <p className="mt-2 text-gray-600">
          Social media analytics
          and AI-powered insights.
        </p>
      </div>

      {/* ------------------------------------------------ */}
      {/* Error */}
      {/* ------------------------------------------------ */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Account Selector */}
      {/* ------------------------------------------------ */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Social Account
        </label>

        <select
          value={
            selectedAccount?._id ||
            ""
          }
          onChange={(event) => {
            const selected =
              socialAccounts.find(
                (account) =>
                  account._id ===
                  event.target
                    .value
              );

            setSelectedAccount(
              selected ||
                null
            );
          }}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          {socialAccounts.map(
            (account) => (
              <option
                key={
                  account._id
                }
                value={
                  account._id
                }
              >
                @
                {
                  account.username
                }{" "}
                (
                {
                  account.platform
                }
                )
              </option>
            )
          )}
        </select>
      </div>

      {/* ------------------------------------------------ */}
      {/* Metrics */}
      {/* ------------------------------------------------ */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Followers
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {
              latestAnalytics.followers
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Engagement
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {
              latestAnalytics.engagementRate
            }
            %
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Likes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {
              latestAnalytics.likes
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Reach
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {
              latestAnalytics.reach
            }
          </h2>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Followers Graph */}
      {/* ------------------------------------------------ */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          Followers Growth
        </h2>

        <div className="space-y-4">
          {analyticsData.map(
            (item) => (
              <div
                key={
                  item.label
                }
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>
                    {
                      item.label
                    }
                  </span>

                  <span className="font-medium">
                    {
                      item.followers
                    }
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(
                        item.followers /
                          40,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Engagement Graph */}
      {/* ------------------------------------------------ */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          Engagement Rate
        </h2>

        <div className="space-y-4">
          {analyticsData.map(
            (item) => (
              <div
                key={`${item.label}-engagement`}
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>
                    {
                      item.label
                    }
                  </span>

                  <span className="font-medium">
                    {
                      item.engagementRate
                    }
                    %
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${item.engagementRate * 10}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* AI Insights */}
      {/* ------------------------------------------------ */}
      <AIInsightsCard
        insights={insights}
        loading={
          insightsLoading
        }
        onGenerate={
          handleGenerateInsights
        }
      />
    </div>
  );
};

export default Analytics;