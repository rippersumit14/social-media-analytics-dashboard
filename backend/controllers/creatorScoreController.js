import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import {
  calculateCreatorScore,
  getLatestCreatorScore,
  getCreatorScoreHistory,
} from "../services/creatorScoreService.js";

/**
 * --------------------------------------------------
 * Calculate Creator Score
 * --------------------------------------------------
 * POST /api/creator-score/calculate
 */

export const calculateScore =
  asyncHandler(async (req, res) => {

    const score =
      await calculateCreatorScore(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Creator score calculated successfully",
        data: score,
      })
    );
  });

/**
 * --------------------------------------------------
 * Get Latest Creator Score
 * --------------------------------------------------
 * GET /api/creator-score/latest
 */

export const getLatestScore =
  asyncHandler(async (req, res) => {

    const score =
      await getLatestCreatorScore(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Latest creator score fetched successfully",
        data: score,
      })
    );
  });

/**
 * --------------------------------------------------
 * Get Creator Score History
 * --------------------------------------------------
 * GET /api/creator-score/history
 */

export const getScoreHistory =
  asyncHandler(async (req, res) => {

    const limit =
      Number(req.query.limit) || 30;

    const history =
      await getCreatorScoreHistory(
        req.user._id,
        limit
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Creator score history fetched successfully",
        data: history,
      })
    );
  });