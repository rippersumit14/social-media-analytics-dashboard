import AppError from "../utils/AppError.js";

import InstagramAccount from "../models/InstagramAccount.js";
import InstagramMedia from "../models/InstagramMedia.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import CreatorScore from "../models/CreatorScore.js";

/**
 * --------------------------------------------------
 * Calculate Creator Score
 * --------------------------------------------------
 *
 * Formula V1
 *
 * Engagement Score  = 40
 * Activity Score    = 20
 * Consistency Score = 20
 * Growth Score      = 20
 *
 * Total             = 100
 */

export const calculateCreatorScore = async (userId) => {
  try {
    /**
     * ------------------------------------------
     * Find Instagram Account
     * ------------------------------------------
     */

    const account = await InstagramAccount.findOne({
      user: userId,
      isActive: true,
    });

    if (!account) {
      throw new AppError("No connected Instagram account found", 404);
    }

    /**
     * ------------------------------------------
     * Latest Analytics Snapshot
     * ------------------------------------------
     */

    const snapshot = await AnalyticsSnapshot.findOne({
      account: account._id,
    }).sort({
      snapshotDate: -1,
    });

    if (!snapshot) {
      throw new AppError("No analytics snapshot found", 404);
    }

    /**
     * ------------------------------------------
     * Media
     * ------------------------------------------
     */

    const media = await InstagramMedia.find({
      instagramAccount: account._id,
      isDeleted: false,
    });

    /**
     * ==========================================
     * Engagement Score (40)
     * ==========================================
     */

    let engagementScore = 0;

    const avgEngagement = snapshot.averageEngagement || 0;

    engagementScore = Math.min(avgEngagement / 5, 40);

    /**
     * ==========================================
     * Activity Score (20)
     * ==========================================
     */

    let activityScore = 0;

    const mediaCount = snapshot.mediaCount || 0;

    activityScore = Math.min(mediaCount, 20);

    /**
     * ==========================================
     * Consistency Score (20)
     * ==========================================
     */

    let consistencyScore = 0;

    if (media.length > 0) {
      const latestPost = media.sort(
        (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
      )[0];

      const daysSinceLastPost = Math.floor(
        (Date.now() - new Date(latestPost.postedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      consistencyScore = Math.max(20 - daysSinceLastPost, 0);
    }

    /**
     * ==========================================
     * Growth Score (20)
     * ==========================================
     */

    let growthScore = 0;

    const previousSnapshot = await AnalyticsSnapshot.findOne({
      account: account._id,
      _id: {
        $ne: snapshot._id,
      },
    }).sort({
      snapshotDate: -1,
    });

    if (previousSnapshot) {
      const engagementGrowth =
        snapshot.totalEngagement - previousSnapshot.totalEngagement;

      const followerGrowth =
        snapshot.followers - previousSnapshot.followers;

      growthScore = Math.min(
        (engagementGrowth + followerGrowth) / 5,
        20
      );

      growthScore = Math.max(growthScore, 0);
    }

    /**
     * ==========================================
     * Final Score
     * ==========================================
     */

    const totalScore = Math.round(
      engagementScore + activityScore + consistencyScore + growthScore
    );

    /**
     * ==========================================
     * Save Score History
     * ==========================================
     */

    console.log({
      avgEngagement,
      engagementScore,
      activityScore,
      consistencyScore,
      growthScore,
    });

    console.log({
      totalScore,
    });

    const creatorScore = await CreatorScore.create({
      instagramAccount: account._id,

      totalScore,

      engagementScore,

      growthScore,

      consistencyScore,

      activityScore,

      breakdown: {
        followers: snapshot.followers,
        mediaCount: snapshot.mediaCount,
        totalLikes: snapshot.totalLikes,
        totalComments: snapshot.totalComments,
        totalEngagement: snapshot.totalEngagement,
        averageEngagement: snapshot.averageEngagement,
      },

      metadata: {
        username: account.username,
        accountType: account.accountType,
      },

      scoreVersion: "v1",

      calculatedAt: new Date(),
    });

    return creatorScore;
  } catch (error) {
    console.log("\n=================================");
    console.log("CREATOR SCORE FAILED");
    console.log("=================================");
    console.log("MESSAGE:", error.message);
    console.log("STACK:");
    console.log(error.stack);
    console.log("=================================\n");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to calculate creator score", 500);
  }
};

/**
 * --------------------------------------------------
 * Get Latest Creator Score
 * --------------------------------------------------
 */

export const getLatestCreatorScore = async (userId) => {
  const account = await InstagramAccount.findOne({
    user: userId,
    isActive: true,
  });

  if (!account) {
    throw new AppError("No connected Instagram account found", 404);
  }

  return CreatorScore.findOne({
    instagramAccount: account._id,
  }).sort({
    calculatedAt: -1,
  });
};

/**
 * --------------------------------------------------
 * Get Creator Score History
 * --------------------------------------------------
 */

export const getCreatorScoreHistory = async (userId, limit = 30) => {
  const account = await InstagramAccount.findOne({
    user: userId,
    isActive: true,
  });

  if (!account) {
    throw new AppError("No connected Instagram account found", 404);
  }

  return CreatorScore.find({
    instagramAccount: account._id,
  })
    .sort({
      calculatedAt: -1,
    })
    .limit(limit);
};