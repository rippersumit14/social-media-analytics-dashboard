import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

import InstagramAccount from "../models/InstagramAccount.js";
import InstagramMedia from "../models/InstagramMedia.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import {
  buildAccountMetrics,
  getMetricValue,
  hasManualMetrics,
} from "../utils/instagramMetricSources.js";

/**
 * --------------------------------------------------
 * Create Analytics Snapshot
 * --------------------------------------------------
 *
 * Flow:
 *
 * Account
 *    ↓
 * Fetch Media
 *    ↓
 * Calculate Metrics
 *    ↓
 * Compare Previous Snapshot
 *    ↓
 * Save Snapshot
 */

export const createAnalyticsSnapshot = async (userId) => {
  try {
    /**
     * --------------------------------------------------
     * Find Connected Account
     * --------------------------------------------------
     */

    const account = await InstagramAccount.findOne({
      user: userId,
      isActive: true,
    });

    if (!account) {
      throw new AppError("No connected Instagram account found", 404);
    }

    /**
     * --------------------------------------------------
     * Fetch Stored Media
     * --------------------------------------------------
     */

    const media = await InstagramMedia.find({
      instagramAccount: account._id,
      isDeleted: false,
    });

    /**
     * --------------------------------------------------
     * Calculate Engagement Metrics
     * --------------------------------------------------
     */

    const totalLikes = media.reduce(
      (sum, item) => sum + (item.analytics?.likeCount || 0),
      0
    );

    const totalComments = media.reduce(
      (sum, item) => sum + (item.analytics?.commentCount || 0),
      0
    );

    const totalEngagement = media.reduce(
      (sum, item) => sum + (item.analytics?.engagementCount || 0),
      0
    );

    const accountMetrics =
      buildAccountMetrics(
        account
      );

    const fallbackMediaCount =
      getMetricValue(
        accountMetrics,
        "mediaCount"
      );

    const syncedMediaCount =
      media.length;

    const mediaCount =
      syncedMediaCount > 0
        ? syncedMediaCount
        : fallbackMediaCount || 0;

    const averageLikes =
      syncedMediaCount > 0 ? Math.round(totalLikes / syncedMediaCount) : 0;

    const averageComments =
      syncedMediaCount > 0 ? Math.round(totalComments / syncedMediaCount) : 0;

    const averageEngagement =
      syncedMediaCount > 0 ? Math.round(totalEngagement / syncedMediaCount) : 0;

    /**
     * --------------------------------------------------
     * Previous Snapshot
     * --------------------------------------------------
     */

    const previousSnapshot = await AnalyticsSnapshot.findOne({
      account: account._id,
    }).sort({
      snapshotDate: -1,
    });

    /**
     * --------------------------------------------------
     * Growth Calculations
     * --------------------------------------------------
     */

    const followerCount =
      getMetricValue(
        accountMetrics,
        "followers"
      );

    const followingCount =
      getMetricValue(
        accountMetrics,
        "follows"
      );

    const followersAvailable =
      followerCount !== null;

    let followerGrowth = null;

    let engagementGrowth = 0;

    let mediaGrowth = 0;

    if (previousSnapshot) {
      followerGrowth =
        followersAvailable &&
        Number.isFinite(
          Number(previousSnapshot.followers)
        )
          ? followerCount -
            Number(previousSnapshot.followers)
          : null;

      engagementGrowth =
        totalEngagement - previousSnapshot.totalEngagement;

      mediaGrowth = mediaCount - previousSnapshot.mediaCount;
    }

    /**
     * --------------------------------------------------
     * Creator Score V1
     * --------------------------------------------------
     *
     * Simple version.
     * We'll replace later with
     * weighted scoring engine.
     */

    let creatorScore = null;

    if (
      followersAvailable ||
      mediaCount > 0 ||
      averageEngagement > 0
    ) {
      creatorScore = 0;

      creatorScore += Math.min((followerCount || 0) / 100, 40);

      creatorScore += Math.min(averageEngagement / 10, 40);

      creatorScore += Math.min(mediaCount, 20);

      creatorScore = Math.round(Math.min(creatorScore, 100));
    }

    /**
     * --------------------------------------------------
     * Save Snapshot
     * --------------------------------------------------
     */

    const snapshot = await AnalyticsSnapshot.create({
      account: account._id,

      snapshotDate: new Date(),

      followers: followerCount,

      following: followingCount,

      mediaCount,

      totalLikes,

      totalComments,

      totalEngagement,

      averageLikes,

      averageComments,

      averageEngagement,

      followerGrowth,

      engagementGrowth,

      mediaGrowth,

      creatorScore,

      metadata: {
        username: account.username,
        accountType: account.accountType,
        dataLimitationMessage:
          hasManualMetrics(accountMetrics)
            ? "This snapshot uses manually entered Instagram metrics because Meta did not return complete provider-confirmed data."
            : null,
        metricsAvailability:
          account.metricsAvailability,
        metricSources:
          accountMetrics,
        hasManualMetrics:
          hasManualMetrics(
            accountMetrics
          ),
      },
    });

    return snapshot;
  } catch (error) {
    logger.warn("Analytics snapshot failed", {
      message: error.message,
      statusCode: error.statusCode,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to create analytics snapshot", 500);
  }
};

/**
 * --------------------------------------------------
 * Get Latest Analytics Snapshot
 * --------------------------------------------------
 */

export const getLatestAnalyticsSnapshot = async (userId) => {
  const account = await InstagramAccount.findOne({
    user: userId,
    isActive: true,
  });

  if (!account) {
    throw new AppError("No connected Instagram account found", 404);
  }

  const snapshot = await AnalyticsSnapshot.findOne({
    account: account._id,
  }).sort({
    snapshotDate: -1,
  });

  return snapshot;
};

/**
 * --------------------------------------------------
 * Get Analytics History
 * --------------------------------------------------
 */

export const getAnalyticsHistory = async (userId, limit = 30) => {
  const account = await InstagramAccount.findOne({
    user: userId,
    isActive: true,
  });

  if (!account) {
    throw new AppError("No connected Instagram account found", 404);
  }

  return AnalyticsSnapshot.find({
    account: account._id,
  })
    .sort({
      snapshotDate: -1,
    })
    .limit(limit);
};
