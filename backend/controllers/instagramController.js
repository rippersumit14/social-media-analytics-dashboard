import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

import InstagramAccount from "../models/InstagramAccount.js";

import {
  createOAuthState,
  getUserIdFromState,
  deleteOAuthState,
} from "../services/oauthStateService.js";

import {
  generateInstagramAuthURL,
  exchangeCodeForToken,
  getInstagramAccountInfo,
} from "../services/instagramService.js";

/**
 * --------------------------------------------------
 * Connect Instagram
 * --------------------------------------------------
 * GET /api/instagram/connect
 *
 * Purpose:
 * Generates Meta OAuth URL and creates
 * temporary OAuth state in Redis.
 *
 * Flow:
 * User
 *   ↓
 * JWT Auth
 *   ↓
 * Create UUID State
 *   ↓
 * Store UUID -> UserId in Redis
 *   ↓
 * Generate OAuth URL
 *   ↓
 * Return URL to frontend
 */

export const connectInstagram =
  asyncHandler(async (req, res) => {

    /**
     * Create temporary OAuth state
     *
     * Redis:
     * oauth:<uuid> -> userId
     */
    const state =
      await createOAuthState(
        req.user._id.toString()
      );

    /**
     * Generate OAuth URL
     */
    const authURL =
      generateInstagramAuthURL(
        state
      );

    return res.status(200).json(
      new ApiResponse(
        true,
        "Instagram OAuth URL generated successfully",
        {
          authURL,
        }
      )
    );
  });

/**
 * --------------------------------------------------
 * Instagram OAuth Callback
 * --------------------------------------------------
 * GET /api/instagram/oauth/callback
 *
 * Meta redirects user here after:
 * - Instagram login
 * - Permission approval
 *
 * Query Params:
 * ?code=...
 * ?state=...
 *
 * Flow:
 * Meta
 *   ↓
 * Callback
 *   ↓
 * Resolve UserId From Redis
 *   ↓
 * Exchange Code For Token
 *   ↓
 * Fetch Instagram Profile
 *   ↓
 * Save Instagram Account
 *   ↓
 * Delete OAuth State
 */

export const instagramOAuthCallback =
  asyncHandler(async (req, res) => {

    /**
     * Meta sends:
     * ?code=
     * ?state=
     */
    const {
      code,
      state,
    } = req.query;

    if (!code || !state) {
      throw new AppError(
        "Missing OAuth callback parameters",
        400
      );
    }

    /**
     * Resolve UserId
     * From Redis State
     */
    const userId =
      await getUserIdFromState(
        state
      );

    /**
     * Exchange OAuth Code
     * For Access Token
     */
    const tokenData =
      await exchangeCodeForToken(
        code
      );

    const accessToken =
      tokenData.access_token;

    if (!accessToken) {
      throw new AppError(
        "Failed to obtain access token",
        500
      );
    }

    /**
     * Fetch Instagram Profile
     */
    const accountInfo =
      await getInstagramAccountInfo(
        accessToken
      );

    /**
     * Prevent Duplicate Connections
     */
    const existingAccount =
      await InstagramAccount.findOne({
        instagramUserId:
          accountInfo.instagramUserId,
      });

    if (existingAccount) {
      throw new AppError(
        "Instagram account already connected",
        409
      );
    }

    /**
     * Save Instagram Account
     */
    const account =
      await InstagramAccount.create({
        user: userId,

        instagramUserId:
          accountInfo.instagramUserId,

        pageId:
          accountInfo.pageId,

        username:
          accountInfo.username,

        profileImage:
          accountInfo.profileImage,

        followers:
          accountInfo.followers,

        mediaCount:
          accountInfo.mediaCount,

        accessToken,

        isPrimary: true,

        lastSyncedAt:
          new Date(),
      });

    /**
     * OAuth completed successfully.
     *
     * Remove temporary Redis state.
     */
    await deleteOAuthState(
      state
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        "Instagram account connected successfully",
        account
      )
    );
  });