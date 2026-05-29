import api from "./api.js";

/**
 * -------------------------------------------------------
 * Safe numeric normalization.
 * -------------------------------------------------------
 */
const toNumber = (
  value,
  fallback = 0
) => {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;
};

/**
 * -------------------------------------------------------
 * Safe array normalization.
 * -------------------------------------------------------
 */
const toArray = (
  value
) => {
  return Array.isArray(
    value
  )
    ? value
    : [];
};

/**
 * -------------------------------------------------------
 * Normalize social account safely.
 * -------------------------------------------------------
 */
const normalizeSocialAccount = (
  account = {}
) => {
  return {
    _id:
      account._id || "",

    username:
      account.username ||
      "unknown",

    platform:
      account.platform ||
      "social",

    profileImage:
      account.profileImage ||
      "",

    lastSyncedAt:
      account.lastSyncedAt ||
      null,

    createdAt:
      account.createdAt ||
      null,

    updatedAt:
      account.updatedAt ||
      null,
  };
};

/**
 * -------------------------------------------------------
 * Normalize analytics metrics safely.
 * -------------------------------------------------------
 */
const normalizeMetrics = (
  metrics = {}
) => {
  return {
    followers:
      toNumber(
        metrics.followers ||
          metrics.followersCount
      ),

    engagementRate:
      toNumber(
        metrics.engagementRate
      ),

    likes:
      toNumber(
        metrics.likes
      ),

    comments:
      toNumber(
        metrics.comments
      ),

    shares:
      toNumber(
        metrics.shares
      ),

    reach:
      toNumber(
        metrics.reach
      ),

    impressions:
      toNumber(
        metrics.impressions
      ),

    saves:
      toNumber(
        metrics.saves
      ),

    profileViews:
      toNumber(
        metrics.profileViews
      ),

    postCount:
      toNumber(
        metrics.postCount
      ),
  };
};

/**
 * -------------------------------------------------------
 * Normalize chart item safely.
 * -------------------------------------------------------
 */
const normalizeChartItem = (
  item = {},
  fallbackLabel = ""
) => {
  return {
    label:
      item.label ||
      item.date ||
      fallbackLabel,

    value:
      toNumber(
        item.value ||
          item.followers ||
          item.engagement ||
          item.reach
      ),

    followers:
      toNumber(
        item.followers
      ),

    engagement:
      toNumber(
        item.engagement
      ),

    reach:
      toNumber(
        item.reach
      ),

    date:
      item.date ||
      fallbackLabel,
  };
};

/**
 * -------------------------------------------------------
 * Normalize charts safely.
 * -------------------------------------------------------
 */
const normalizeCharts = (
  charts = {}
) => {
  return {
    followersGrowth:
      toArray(
        charts.followersGrowth
      ).map(
        (
          item,
          index
        ) =>
          normalizeChartItem(
            item,
            `Day ${index + 1}`
          )
      ),

    engagementTrend:
      toArray(
        charts.engagementTrend
      ).map(
        (
          item,
          index
        ) =>
          normalizeChartItem(
            item,
            `Day ${index + 1}`
          )
      ),

    reachTrend:
      toArray(
        charts.reachTrend
      ).map(
        (
          item,
          index
        ) =>
          normalizeChartItem(
            item,
            `Day ${index + 1}`
          )
      ),
  };
};

/**
 * -------------------------------------------------------
 * Generate stable fallback charts.
 * -------------------------------------------------------
 *
 * IMPORTANT:
 * Prevent analytics crashes
 * when backend charts are missing.
 * -------------------------------------------------------
 */
const generateFallbackCharts =
  (
    metrics = {}
  ) => {
    const followers =
      toNumber(
        metrics.followers
      );

    const engagement =
      toNumber(
        metrics.engagementRate
      );

    const reach =
      toNumber(
        metrics.reach
      );

    return {
      followersGrowth: [
        {
          label:
            "Week 1",
          value:
            followers - 120,
          followers:
            followers - 120,
        },
        {
          label:
            "Week 2",
          value:
            followers - 70,
          followers:
            followers - 70,
        },
        {
          label:
            "Week 3",
          value:
            followers - 20,
          followers:
            followers - 20,
        },
        {
          label:
            "Week 4",
          value:
            followers,
          followers,
        },
      ],

      engagementTrend: [
        {
          label:
            "Week 1",
          value:
            engagement - 1,
          engagement:
            engagement - 1,
        },
        {
          label:
            "Week 2",
          value:
            engagement - 0.5,
          engagement:
            engagement - 0.5,
        },
        {
          label:
            "Week 3",
          value:
            engagement - 0.2,
          engagement:
            engagement - 0.2,
        },
        {
          label:
            "Week 4",
          value:
            engagement,
          engagement,
        },
      ],

      reachTrend: [
        {
          label:
            "Week 1",
          value:
            reach - 500,
          reach:
            reach - 500,
        },
        {
          label:
            "Week 2",
          value:
            reach - 300,
          reach:
            reach - 300,
        },
        {
          label:
            "Week 3",
          value:
            reach - 100,
          reach:
            reach - 100,
        },
        {
          label:
            "Week 4",
          value: reach,
          reach,
        },
      ],
    };
  };

/**
 * -------------------------------------------------------
 * Normalize snapshot safely.
 * -------------------------------------------------------
 */
const normalizeSnapshot = (
  snapshot = {},
  index = 0
) => {
  const metrics =
    normalizeMetrics(
      snapshot.metrics ||
        snapshot
    );

  const normalizedCharts =
    normalizeCharts(
      snapshot.charts ||
        {}
    );

  /**
   * -----------------------------------------------------
   * Fallback chart protection.
   * -----------------------------------------------------
   */
  const hasCharts =
    normalizedCharts
      .followersGrowth
      .length > 0;

  return {
    _id:
      snapshot._id || "",

    /**
     * Snapshot metadata.
     */
    label:
      snapshot.label ||
      `Snapshot ${index + 1}`,

    socialAccount:
      snapshot.socialAccount ||
      null,

    createdAt:
      snapshot.createdAt ||
      null,

    updatedAt:
      snapshot.updatedAt ||
      null,

    /**
     * Core metrics.
     */
    followers:
      metrics.followers,

    engagementRate:
      metrics.engagementRate,

    likes:
      metrics.likes,

    comments:
      metrics.comments,

    shares:
      metrics.shares,

    reach:
      metrics.reach,

    impressions:
      metrics.impressions,

    saves:
      metrics.saves,

    profileViews:
      metrics.profileViews,

    postCount:
      metrics.postCount,

    /**
     * Full metrics.
     */
    metrics,

    /**
     * AI analytics.
     */
    insights:
      snapshot.insights ||
      {},

    engagement:
      snapshot.engagement ||
      {},

    audience:
      snapshot.audience ||
      {},

    growth:
      snapshot.growth ||
      {},

    content:
      snapshot.content ||
      {},

    /**
     * Stable charts.
     */
    charts: hasCharts
      ? normalizedCharts
      : generateFallbackCharts(
          metrics
        ),
  };
};

/**
 * -------------------------------------------------------
 * Normalize backend response safely.
 * -------------------------------------------------------
 */
const normalizeResponse = (
  responseData = {}
) => {
  const snapshotsSource =
    responseData.snapshots ||
    responseData.data
      ?.snapshots ||
    [];

  const normalizedSnapshots =
    snapshotsSource.map(
      (
        snapshot,
        index
      ) =>
        normalizeSnapshot(
          snapshot,
          index
        )
    );

  return {
    success:
      responseData.success ??
      true,

    message:
      responseData.message ||
      "",

    /**
     * Connected accounts.
     */
    accounts:
      (
        responseData.accounts ||
        responseData.data
          ?.accounts ||
        []
      ).map(
        normalizeSocialAccount
      ),

    /**
     * Analytics snapshots.
     */
    snapshots:
      normalizedSnapshots,

    /**
     * Latest snapshot.
     */
    latestSnapshot:
      responseData.latestSnapshot
        ? normalizeSnapshot(
            responseData.latestSnapshot
          )
        : normalizedSnapshots[
            normalizedSnapshots.length -
              1
          ] || null,

    /**
     * Raw backend payload.
     */
    data:
      responseData.data ||
      responseData,
  };
};

/**
 * -------------------------------------------------------
 * Handle API errors safely.
 * -------------------------------------------------------
 */
const handleApiError = (
  error,
  fallbackMessage
) => {
  console.error(
    "[SOCIAL ANALYTICS API ERROR]",
    error
  );

  const backendMessage =
    error?.response?.data
      ?.message;

  throw new Error(
    backendMessage ||
      error.message ||
      fallbackMessage
  );
};

/**
 * -------------------------------------------------------
 * Get connected social accounts.
 * -------------------------------------------------------
 */
export const getSocialAccounts =
  async ({
    signal,
  } = {}) => {
    try {
      const response =
        await api.get(
          "/social-accounts",
          {
            signal,
          }
        );

      return normalizeResponse(
        response.data
      );
    } catch (error) {
      handleApiError(
        error,
        "Failed to load social accounts."
      );
    }
  };

/**
 * -------------------------------------------------------
 * Trigger analytics sync.
 * -------------------------------------------------------
 */
export const syncSocialAccount =
  async ({
    socialAccountId,
    signal,
  }) => {
    if (!socialAccountId) {
      throw new Error(
        "Social account ID is required."
      );
    }

    try {
      const response =
        await api.post(
          `/social-accounts/${socialAccountId}/sync`,
          {},
          {
            signal,
          }
        );

      return normalizeResponse(
        response.data
      );
    } catch (error) {
      handleApiError(
        error,
        "Failed to sync social account."
      );
    }
  };

/**
 * -------------------------------------------------------
 * Get analytics snapshots.
 * -------------------------------------------------------
 */
export const getAnalyticsSnapshots =
  async ({
    socialAccountId,
    signal,
  }) => {
    if (!socialAccountId) {
      throw new Error(
        "Social account ID is required."
      );
    }

    try {
      const response =
        await api.get(
          `/analytics-snapshots/${socialAccountId}`,
          {
            signal,
          }
        );

      return normalizeResponse(
        response.data
      );
    } catch (error) {
      handleApiError(
        error,
        "Failed to load analytics snapshots."
      );
    }
  };