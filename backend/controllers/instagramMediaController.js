import asyncHandler from "../middlewares/asyncHandler.js";

import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

import InstagramAccount from "../models/InstagramAccount.js";

import {
  syncInstagramMedia,
} from "../services/instagramMediaService.js";

/**
 * --------------------------------------------------
 * Sync Instagram Media
 * --------------------------------------------------
 *
 * POST /api/instagram/media/sync
 *
 * Flow:
 *
 * User
 *   ↓
 * JWT Auth
 *   ↓
 * Find Connected Instagram Account
 *   ↓
 * Get Access Token
 *   ↓
 * Sync Media
 *   ↓
 * Return Statistics
 */

export const syncMedia =
  asyncHandler(async (req, res) => {

    const account =
      await InstagramAccount
        .findOne({
          user: req.user._id,

          isActive: true,
        })
        .select("+accessToken");

    if (!account) {
      throw new AppError(
        "No connected Instagram account found",
        404
      );
    }

    const result =
      await syncInstagramMedia({
        instagramAccountId:
          account._id,

        accessToken:
          account.accessToken,
      });

    return res.status(200).json(
      new ApiResponse({
        success: true,

        statusCode: 200,

        message:
          "Instagram media synced successfully",

        data: result,
      })
    );
  });