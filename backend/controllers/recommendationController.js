import asyncHandler
  from "../middlewares/asyncHandler.js";

import {
  generateRecommendations,
  getRecommendations,
} from "../services/recommendationService.js";

/**
 * --------------------------------------------------
 * Generate Recommendations
 * --------------------------------------------------
 *
 * Creates fresh recommendations
 * for the authenticated user.
 */

export const generateRecommendationsController =
  asyncHandler(
    async (
      req,
      res
    ) => {

      const result =
        await generateRecommendations(
          req.user._id
        );

      return res.status(200).json({
        success: true,

        message:
          "Recommendations generated successfully",

        data: result,
      });
    }
  );

/**
 * --------------------------------------------------
 * Get Recommendations
 * --------------------------------------------------
 *
 * Returns latest active recommendations
 * for the authenticated user.
 */

export const getRecommendationsController =
  asyncHandler(
    async (
      req,
      res
    ) => {

      const recommendations =
        await getRecommendations(
          req.user._id
        );

      return res.status(200).json({
        success: true,

        count:
          recommendations.length,

        data:
          recommendations,
      });
    }
  );
