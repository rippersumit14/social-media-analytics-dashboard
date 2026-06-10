import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import {
  generateCreatorInsights,
  getCreatorInsights,
} from "../services/creatorInsightsService.js";

/**
 * --------------------------------------------------
 * Generate Insights
 * --------------------------------------------------
 * POST /api/creator-insights/generate
 */

export const generateInsights =
  asyncHandler(async (req, res) => {

    const result =
      await generateCreatorInsights(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Creator insights generated successfully",
        data: result,
      })
    );
  });

/**
 * --------------------------------------------------
 * Get Insights
 * --------------------------------------------------
 * GET /api/creator-insights
 */

export const getInsights =
  asyncHandler(async (req, res) => {

    const limit =
      Number(req.query.limit) || 20;

    const insights =
      await getCreatorInsights(
        req.user._id,
        limit
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Creator insights fetched successfully",
        data: insights,
      })
    );
  });