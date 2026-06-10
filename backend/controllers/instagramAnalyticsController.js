import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import {
  createAnalyticsSnapshot,
  getAnalyticsHistory,
  getLatestAnalyticsSnapshot,
} from "../services/instagramAnalyticsService.js";

/**
 * --------------------------------------------------
 * Create Analytics Snapshot
 * --------------------------------------------------
 * POST /api/instagram/analytics/snapshot
 *
 * Manually creates a snapshot.
 *
 * Later:
 * - Cron Job
 * - Queue Worker
 * will call the same service.
 */

export const createSnapshot = asyncHandler(
  async (req, res) => {
    const result =
      await createAnalyticsSnapshot(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Analytics snapshot created successfully",
        data: result,
      })
    );
  }
);

/**
 * --------------------------------------------------
 * Get Latest Snapshot
 * --------------------------------------------------
 * GET /api/instagram/analytics/latest
 */

export const getLatestSnapshot =
  asyncHandler(async (req, res) => {
    const snapshot =
      await getLatestAnalyticsSnapshot(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Latest analytics snapshot fetched successfully",
        data: snapshot,
      })
    );
  });

/**
 * --------------------------------------------------
 * Get Snapshot History
 * --------------------------------------------------
 * GET /api/instagram/analytics/history
 *
 * Query:
 * ?limit=30
 */

export const getAnalyticsSnapshots =
  asyncHandler(async (req, res) => {
    const limit =
      Number(req.query.limit) || 30;

    const snapshots =
      await getAnalyticsHistory(
        req.user._id,
        limit
      );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Analytics history fetched successfully",
        data: snapshots,
      })
    );
  });