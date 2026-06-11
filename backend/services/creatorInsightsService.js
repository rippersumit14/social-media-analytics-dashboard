import AppError from "../utils/AppError.js";

import InstagramAccount from "../models/InstagramAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import CreatorScore from "../models/CreatorScore.js";
import InstagramMedia from "../models/InstagramMedia.js";
import CreatorInsight from "../models/CreatorInsight.js";

/**
 * --------------------------------------------------
 * Generate Creator Insights
 * --------------------------------------------------
 */

export const generateCreatorInsights = async (userId) => {
  try {
    /**
     * ------------------------------------------
     * Instagram Account
     * ------------------------------------------
     */

    const account = await InstagramAccount.findOne({
      user: userId,
      isActive: true,
    });

    if (!account) {
      throw new AppError("Instagram account not found", 404);
    }

    /**
     * ------------------------------------------
     * Latest Analytics Snapshots
     * ------------------------------------------
     */

    const snapshots = await AnalyticsSnapshot.find({
      account: account._id,
    })
      .sort({
        snapshotDate: -1,
      })
      .limit(2);

    if (snapshots.length === 0) {
      throw new AppError("No analytics snapshots found", 404);
    }

    const currentSnapshot = snapshots[0];

    const previousSnapshot = snapshots[1] || null;

    /**
     * ------------------------------------------
     * Latest Creator Scores
     * ------------------------------------------
     */

    const scores = await CreatorScore.find({
      instagramAccount: account._id,
    })
      .sort({
        calculatedAt: -1,
      })
      .limit(2);

    const currentScore = scores[0] || null;

    const previousScore = scores[1] || null;

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
     * ------------------------------------------
     * Clear Existing Active Insights
     * ------------------------------------------
     */

    await CreatorInsight.updateMany(
      {
        instagramAccount: account._id,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
        },
      }
    );

    const insights = [];

    /**
     * ==================================================
     * Follower Growth Insight
     * ==================================================
     */

    if (previousSnapshot) {
      const followerGrowth =
        currentSnapshot.followers - previousSnapshot.followers;

      if (followerGrowth > 0) {
        insights.push({
          instagramAccount: account._id,

          type: "growth",

          priority: "medium",

          title: "Follower Growth Detected",

          description: `You gained ${followerGrowth} followers since your previous analytics snapshot.`,

          recommendation:
            "Continue posting consistently to maintain growth.",

          metadata: {
            currentValue: currentSnapshot.followers,

            previousValue: previousSnapshot.followers,

            changePercent:
              previousSnapshot.followers > 0
                ? (
                    (followerGrowth / previousSnapshot.followers) *
                    100
                  ).toFixed(2)
                : 0,
          },
        });
      }

      if (followerGrowth < 0) {
        insights.push({
          instagramAccount: account._id,

          type: "growth",

          priority: "high",

          title: "Follower Decline Detected",

          description: `You lost ${Math.abs(
            followerGrowth
          )} followers since your previous snapshot.`,

          recommendation:
            "Review recent content performance and posting strategy.",

          metadata: {
            currentValue: currentSnapshot.followers,

            previousValue: previousSnapshot.followers,
          },
        });
      }
    }

    /**
     * ==================================================
     * Creator Score Insight
     * ==================================================
     */

    if (currentScore && previousScore) {
      const scoreDifference =
        currentScore.totalScore - previousScore.totalScore;

      if (scoreDifference > 5) {
        insights.push({
          instagramAccount: account._id,

          type: "score",

          priority: "medium",

          title: "Creator Score Improved",

          description: `Your creator score increased by ${scoreDifference} points.`,

          recommendation:
            "Keep repeating the content patterns driving growth.",

          metadata: {
            currentValue: currentScore.totalScore,

            previousValue: previousScore.totalScore,
          },
        });
      }

      if (scoreDifference < -5) {
        insights.push({
          instagramAccount: account._id,

          type: "score",

          priority: "high",

          title: "Creator Score Dropped",

          description: `Your creator score decreased by ${Math.abs(
            scoreDifference
          )} points.`,

          recommendation:
            "Increase posting consistency and engagement activity.",

          metadata: {
            currentValue: currentScore.totalScore,

            previousValue: previousScore.totalScore,
          },
        });
      }
    }

    /**
     * ==================================================
     * Consistency Insight
     * ==================================================
     */

    if (media.length > 0) {
      const latestPost = media.sort(
        (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
      )[0];

      const daysSincePost = Math.floor(
        (Date.now() - new Date(latestPost.postedAt)) / (1000 * 60 * 60 * 24)
      );

      if (daysSincePost >= 7) {
        insights.push({
          instagramAccount: account._id,

          type: "consistency",

          priority: "high",

          title: "Posting Consistency Warning",

          description: `You have not posted for ${daysSincePost} days.`,

          recommendation:
            "Publish new content to maintain audience engagement.",

          metadata: {
            currentValue: daysSincePost,
          },
        });
      }
    }

    /**
     * ==================================================
     * Activity Insight
     * ==================================================
     */

    if (currentSnapshot.mediaCount <= 3) {
      insights.push({
        instagramAccount: account._id,

        type: "activity",

        priority: "medium",

        title: "Low Content Volume",

        description:
          "Your account currently has a low amount of published content.",

        recommendation:
          "Increase posting frequency to improve discoverability.",

        metadata: {
          currentValue: currentSnapshot.mediaCount,
        },
      });
    }

    /**
     * ==================================================
     * Save Insights
     * ==================================================
     */

    if (insights.length === 0) {
      return {
        insightCount: 0,
        insights: [],
      };
    }

    const createdInsights = await CreatorInsight.insertMany(insights);

    return {
      insightCount: createdInsights.length,
      insights: createdInsights,
    };
  } catch (error) {
    console.log("\n=================================");
    console.log("CREATOR INSIGHTS FAILED");
    console.log("=================================");
    console.log(error.message);
    console.log("=================================\n");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to generate creator insights", 500);
  }
};

/**
 * --------------------------------------------------
 * Get Latest Insights
 * --------------------------------------------------
 */

export const getCreatorInsights = async (userId, limit = 20) => {
  const account = await InstagramAccount.findOne({
    user: userId,
    isActive: true,
  });

  if (!account) {
    throw new AppError("Instagram account not found", 404);
  }

  return CreatorInsight.find({
    instagramAccount: account._id,
    isActive: true,
  })
    .sort({
      generatedAt: -1,
    })
    .limit(limit);
};