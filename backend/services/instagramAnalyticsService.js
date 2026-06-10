import AppError from "../utils/AppError.js";

import InstagramAccount from "../models/InstagramAccount.js";
import InstagramMedia from "../models/InstagramMedia.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";

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

export const createAnalyticsSnapshot =
  async (userId) => {

    try {

      /**
       * --------------------------------------------------
       * Find Connected Account
       * --------------------------------------------------
       */

      const account =
        await InstagramAccount.findOne({
          user: userId,
          isActive: true,
        });

      if (!account) {
        throw new AppError(
          "No connected Instagram account found",
          404
        );
      }

      /**
       * --------------------------------------------------
       * Fetch Stored Media
       * --------------------------------------------------
       */

      const media =
        await InstagramMedia.find({
          account: account._id,
          isActive: true,
        });

      /**
       * --------------------------------------------------
       * Calculate Engagement Metrics
       * --------------------------------------------------
       */

      const totalLikes =
        media.reduce(
          (sum, item) =>
            sum + (item.likeCount || 0),
          0
        );

      const totalComments =
        media.reduce(
          (sum, item) =>
            sum + (item.commentCount || 0),
          0
        );

      const totalEngagement =
        media.reduce(
          (sum, item) =>
            sum +
            (item.engagementCount || 0),
          0
        );

      const mediaCount =
        media.length;

      const averageLikes =
        mediaCount > 0
          ? Math.round(
              totalLikes /
                mediaCount
            )
          : 0;

      const averageComments =
        mediaCount > 0
          ? Math.round(
              totalComments /
                mediaCount
            )
          : 0;

      const averageEngagement =
        mediaCount > 0
          ? Math.round(
              totalEngagement /
                mediaCount
            )
          : 0;

      /**
       * --------------------------------------------------
       * Previous Snapshot
       * --------------------------------------------------
       */

      const previousSnapshot =
        await AnalyticsSnapshot
          .findOne({
            account:
              account._id,
          })
          .sort({
            snapshotDate: -1,
          });

      /**
       * --------------------------------------------------
       * Growth Calculations
       * --------------------------------------------------
       */

      let followerGrowth = 0;

      let engagementGrowth = 0;

      let mediaGrowth = 0;

      if (
        previousSnapshot
      ) {

        followerGrowth =
          account.followers -
          previousSnapshot.followers;

        engagementGrowth =
          totalEngagement -
          previousSnapshot.totalEngagement;

        mediaGrowth =
          mediaCount -
          previousSnapshot.mediaCount;
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

      let creatorScore = 0;

      creatorScore +=
        Math.min(
          account.followers /
            100,
          40
        );

      creatorScore +=
        Math.min(
          averageEngagement /
            10,
          40
        );

      creatorScore +=
        Math.min(
          mediaCount,
          20
        );

      creatorScore =
        Math.round(
          Math.min(
            creatorScore,
            100
          )
        );

      /**
       * --------------------------------------------------
       * Save Snapshot
       * --------------------------------------------------
       */

      const snapshot =
        await AnalyticsSnapshot.create({
          account:
            account._id,

          snapshotDate:
            new Date(),

          followers:
            account.followers,

          following: 0,

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
            username:
              account.username,

            accountType:
              account.accountType,
          },
        });

      return snapshot;

    } catch (error) {

      console.log(
        "\n================================="
      );

      console.log(
        "ANALYTICS SNAPSHOT FAILED"
      );

      console.log(
        "================================="
      );

      console.log(
        "MESSAGE:",
        error.message
      );

      console.log(
        "STACK:"
      );

      console.log(
        error.stack
      );

      console.log(
        "=================================\n"
      );

      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Failed to create analytics snapshot",
        500
      );
    }
  };

/**
 * --------------------------------------------------
 * Get Latest Analytics Snapshot
 * --------------------------------------------------
 */

export const getLatestAnalyticsSnapshot =
  async (userId) => {

    const account =
      await InstagramAccount.findOne({
        user: userId,
        isActive: true,
      });

    if (!account) {
      throw new AppError(
        "No connected Instagram account found",
        404
      );
    }

    const snapshot =
      await AnalyticsSnapshot
        .findOne({
          account:
            account._id,
        })
        .sort({
          snapshotDate: -1,
        });

    return snapshot;
  };

/**
 * --------------------------------------------------
 * Get Analytics History
 * --------------------------------------------------
 */

export const getAnalyticsHistory =
  async (
    userId,
    limit = 30
  ) => {

    const account =
      await InstagramAccount.findOne({
        user: userId,
        isActive: true,
      });

    if (!account) {
      throw new AppError(
        "No connected Instagram account found",
        404
      );
    }

    return AnalyticsSnapshot
      .find({
        account:
          account._id,
      })
      .sort({
        snapshotDate: -1,
      })
      .limit(limit);
  };