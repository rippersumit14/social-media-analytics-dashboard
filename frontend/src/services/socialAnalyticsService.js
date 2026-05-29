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
 * Normalize charts safely.
 * -------------------------------------------------------
 */
const normalizeCharts = (
  charts = {}
) => {
  return {
    followersGrowth:
      Array.isArray(
        charts.followersGrowth
      )
        ? charts.followersGrowth
        : [],

    engagementTrend:
      Array.isArray(
        charts.engagementTrend
      )
        ? charts.engagementTrend
        : [],

    reachTrend:
      Array.isArray(
        charts.reachTrend
      )
        ? charts.reachTrend
        : [],
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
     * Full metric object.
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
     * Chart structures.
     */
    charts:
      normalizeCharts(
        snapshot.charts
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
  const normalizedSnapshots =
    (
      responseData.snapshots ||
      responseData.data
        ?.snapshots ||
      []
    ).map(
      normalizeSnapshot
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
     * Latest analytics snapshot.
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
 * Get connected social accounts.
 * -------------------------------------------------------
 */
export const getSocialAccounts =
  async ({
    signal,
  } = {}) => {
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
  };