import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";

import {
  generateAnalyticsResponse,
} from "../services/aiService.js";

import asyncHandler
  from "../middlewares/asyncHandler.js";

import AppError
  from "../utils/AppError.js";

import ApiResponse
  from "../utils/ApiResponse.js";

import logger
  from "../utils/logger.js";

import {
  isValidObjectId,
} from "../utils/validateObjectId.js";

/**
 * ---------------------------------------------------
 * Generate AI Analytics Insights
 * ---------------------------------------------------
 *
 * Features:
 * - analytics analysis
 * - growth insights
 * - engagement analysis
 * - creator recommendations
 * - strategic AI feedback
 */

export const getAIInsights =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      socialAccountId,
    } = req.params;

    /**
     * Validate social account id
     */
    if (
      !isValidObjectId(
        socialAccountId
      )
    ) {

      throw new AppError(
        "Invalid social account id",
        400
      );
    }

    /**
     * Fetch user + account in parallel
     */
    const [
      user,
      socialAccount,
    ] =
      await Promise.all([

        User.findById(
          req.user._id
        ),

        SocialAccount.findOne({

          _id:
            socialAccountId,

          user:
            req.user._id,
        }).lean(),
      ]);

    /**
     * User validation
     */
    if (!user) {

      throw new AppError(
        "User not found",
        404
      );
    }

    /**
     * Social account validation
     */
    if (!socialAccount) {

      throw new AppError(
        "Social account not found",
        404
      );
    }

    /**
     * AI usage limit protection
     */
    if (
      user.aiUsageCount >=
      user.aiUsageLimit
    ) {

      throw new AppError(
        "AI usage limit reached",
        403
      );
    }

    /**
     * Fetch analytics snapshots
     */
    const snapshots =
      await AnalyticsSnapshot.find({

        socialAccount:
          socialAccountId,
      })
        .sort({
          capturedAt: 1,
        })

        /**
         * Lightweight query
         */
        .lean();

    /**
     * Empty analytics protection
     */
    if (
      snapshots.length === 0
    ) {

      throw new AppError(
        "No analytics data found",
        404
      );
    }

    /**
     * Build analytics context
     */
    const analyticsContext =
      JSON.stringify(
        snapshots,
        null,
        2
      );

    logger.ai(
      "Generating analytics insights",

      {
        socialAccountId,
      }
    );

    /**
     * Generate AI insights
     */
    const aiResult =
      await generateAnalyticsResponse({

        analyticsContext,

        historyMessages: [],

        latestUserMessage:
          "Analyze this social media analytics data deeply and provide strategic creator insights, performance analysis, audience behavior analysis, growth opportunities, and actionable recommendations.",
      });

    /**
     * Increment AI usage
     */
    user.aiUsageCount += 1;

    await user.save();

    logger.success(
      "Analytics insights generated",

      {
        socialAccountId,

        latencyMs:
          aiResult.latencyMs,
      }
    );

    return res.status(200).json(

      new ApiResponse(
        true,
        "AI insights generated successfully",

        {

          insights:
            aiResult.reply,

          modelUsed:
            aiResult.modelUsed,

          modelName:
            aiResult.modelName,

          latencyMs:
            aiResult.latencyMs,

          generatedAt:
            aiResult.generatedAt,

          remainingUsage:
            Math.max(
              user.aiUsageLimit -
                user.aiUsageCount,
              0
            ),
        }
      )
    );
  });