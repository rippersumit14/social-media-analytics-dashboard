import AppError from "../utils/AppError.js";

import InstagramAccount
  from "../models/InstagramAccount.js";

import CreatorScore
  from "../models/CreatorScore.js";

import CreatorInsight
  from "../models/CreatorInsight.js";

import Recommendation
  from "../models/Recommendation.js";

/**
 * --------------------------------------------------
 * Generate Recommendations
 * --------------------------------------------------
 */

export const generateRecommendations =
  async (userId) => {

    try {

      /**
       * --------------------------------------------------
       * Instagram Account
       * --------------------------------------------------
       */

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

      /**
       * --------------------------------------------------
       * Latest Creator Score
       * --------------------------------------------------
       */

      const creatorScore =
        await CreatorScore
          .findOne({
            instagramAccount:
              account._id,
          })
          .sort({
            calculatedAt: -1,
          });

      /**
       * --------------------------------------------------
       * Latest Insights
       * --------------------------------------------------
       */

      const insights =
        await CreatorInsight.find({
          instagramAccount:
            account._id,

          isActive: true,
        });

      /**
       * --------------------------------------------------
       * Deactivate Old Recommendations
       * --------------------------------------------------
       */

      await Recommendation.updateMany(
        {
          instagramAccount:
            account._id,

          isActive: true,
        },
        {
          $set: {
            isActive: false,
          },
        }
      );

      const recommendations = [];

      /**
       * ==================================================
       * Creator Score Recommendations
       * ==================================================
       */

      if (creatorScore) {

        if (
          creatorScore.totalScore < 40
        ) {

          recommendations.push({
            instagramAccount:
              account._id,

            type: "growth",

            priority: "high",

            title:
              "Improve Overall Creator Score",

            description:
              "Your creator score is currently low. Focus on increasing content consistency and engagement.",

            action:
              "Post more frequently and improve audience interaction.",

            expectedImpact: 20,

            source:
              "creator-score",
          });
        }

        if (
          creatorScore.engagementScore < 30
        ) {

          recommendations.push({
            instagramAccount:
              account._id,

            type: "engagement",

            priority: "high",

            title:
              "Increase Engagement Rate",

            description:
              "Your audience engagement is below recommended levels.",

            action:
              "Use stronger captions, reels, polls, and audience interactions.",

            expectedImpact: 15,

            source:
              "creator-score",
          });
        }

        if (
          creatorScore.consistencyScore < 30
        ) {

          recommendations.push({
            instagramAccount:
              account._id,

            type: "consistency",

            priority: "medium",

            title:
              "Improve Posting Consistency",

            description:
              "Posting frequency appears inconsistent.",

            action:
              "Create a content schedule and publish consistently.",

            expectedImpact: 10,

            source:
              "creator-score",
          });
        }
      }

      /**
       * ==================================================
       * Insight Based Recommendations
       * ==================================================
       */

      insights.forEach(
        (insight) => {

          recommendations.push({
            instagramAccount:
              account._id,

            type:
              insight.type ||

              "general",

            priority:
              insight.priority ||

              "medium",

            title:
              insight.title,

            description:
              insight.recommendation ||

              insight.description,

            action:
              insight.recommendation ||

              "Review this insight and take action.",

            expectedImpact: 5,

            source:
              "creator-insight",

            metadata: {
              insightId:
                insight._id,
            },
          });
        }
      );

      /**
       * --------------------------------------------------
       * Fallback Recommendation
       * --------------------------------------------------
       */

      if (
        recommendations.length === 0
      ) {

        recommendations.push({
          instagramAccount:
            account._id,

          type: "general",

          priority: "low",

          title:
            "Keep Growing",

          description:
            "Your account is performing steadily. Continue posting quality content.",

          action:
            "Maintain consistency and monitor analytics regularly.",

          expectedImpact: 5,

          source:
            "system",
        });
      }

      /**
       * --------------------------------------------------
       * Save Recommendations
       * --------------------------------------------------
       */

      const savedRecommendations =
        await Recommendation.insertMany(
          recommendations
        );

      return {
        recommendationCount:
          savedRecommendations.length,

        recommendations:
          savedRecommendations,
      };

    } catch (error) {

      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Failed to generate recommendations",
        500
      );
    }
  };

/**
 * --------------------------------------------------
 * Get Recommendations
 * --------------------------------------------------
 */

export const getRecommendations =
  async (
    userId,
    limit = 20
  ) => {

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

    return Recommendation.find({
      instagramAccount:
        account._id,

      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  };