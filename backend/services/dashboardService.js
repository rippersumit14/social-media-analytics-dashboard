import AppError from "../utils/AppError.js";

import InstagramAccount from "../models/InstagramAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import CreatorScore from "../models/CreatorScore.js";
import CreatorInsight from "../models/CreatorInsight.js";
import InstagramMedia from "../models/InstagramMedia.js";
import {
  buildAccountMetrics,
  hasManualMetrics,
} from "../utils/instagramMetricSources.js";

/**
 * --------------------------------------------------
 * Get Dashboard Overview
 * --------------------------------------------------
 *
 * Aggregates:
 *
 * - Account
 * - Latest Analytics
 * - Latest Score
 * - Latest Insights
 * - Top Media
 *
 */

export const getDashboardOverview =
  async (userId) => {

    const account =
      await InstagramAccount.findOne({
        user: userId,
        isActive: true,
      });

    if (!account) {
      throw new AppError(
        "Instagram account not found",
        404
      );
    }

    const [
      latestSnapshot,
      latestScore,
      latestInsights,
      topMedia,
    ] = await Promise.all([

      AnalyticsSnapshot
        .findOne({
          account: account._id,
        })
        .sort({
          snapshotDate: -1,
        }),

      CreatorScore
        .findOne({
          instagramAccount:
            account._id,
        })
        .sort({
          calculatedAt: -1,
        }),

      CreatorInsight
        .find({
          instagramAccount:
            account._id,

          isActive: true,
        })
        .sort({
          generatedAt: -1,
        })
        .limit(10),

      InstagramMedia
        .find({
          instagramAccount:
            account._id,

          isDeleted: false,
        })
        .sort({
          "analytics.engagementCount":
            -1,
        })
        .limit(5),
    ]);

    const metrics =
      buildAccountMetrics(
        account
      );

    return {

      account: {
        id: account._id,

        username:
          account.username,

        displayName:
          account.displayName,

        profileImage:
          account.profileImage,

        followers:
          metrics.followers.value,

        follows:
          metrics.follows.value,

        mediaCount:
          metrics.mediaCount.value,

        metricsAvailability:
          account.metricsAvailability,

        metrics,

        hasManualMetrics:
          hasManualMetrics(
            metrics
          ),

        manualMetrics:
          account.manualMetrics,

        accountType:
          account.accountType,

        lastSyncedAt:
          account.lastSyncedAt,
      },

      latestSnapshot,

      latestScore,

      latestInsights,

      topMedia,
    };
  };
