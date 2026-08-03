import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

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
import {
  buildAccountMetrics,
  hasManualMetrics,
} from "../utils/instagramMetricSources.js";

const getFrontendInstagramRedirect = ({
  status,
  code,
  message,
}) => {
  const baseUrl =
    process.env.INSTAGRAM_FRONTEND_CALLBACK_URL ||
    `${process.env.FRONTEND_URL}/instagram/callback`;

  const url = new URL(baseUrl);

  url.searchParams.set(
    status === "success" ? "connected" : "error",
    code
  );

  if (message) {
    url.searchParams.set(
      "message",
      message
    );
  }

  return url.toString();
};

const normalizeOAuthErrorCode = (error) => {
  if (error?.message?.includes("already connected")) {
    return "account_already_connected";
  }

  if (error?.message?.includes("OAuth state")) {
    return "invalid_state";
  }

  if (error?.message?.includes("access token")) {
    return "token_exchange_failed";
  }

  if (error?.message?.includes("Instagram profile")) {
    return "account_fetch_failed";
  }

  return "oauth_failed";
};

const definedAccountFields = (accountInfo) => {
  const fields = {
    pageId: accountInfo.pageId,
    username: accountInfo.username,
    displayName: accountInfo.displayName,
    profileImage: accountInfo.profileImage,
    followers: accountInfo.followers,
    follows: accountInfo.follows,
    mediaCount: accountInfo.mediaCount,
    accountType: accountInfo.accountType,
    metricsAvailability: accountInfo.metricsAvailability,
  };

  return Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== undefined
    )
  );
};

const manualMetricFields = [
  {
    requestKey:
      "followersCount",
    accountKey:
      "followers",
    manualKey:
      "followers",
  },
  {
    requestKey:
      "followingCount",
    accountKey:
      "follows",
    manualKey:
      "follows",
  },
  {
    requestKey:
      "mediaCount",
    accountKey:
      "mediaCount",
    manualKey:
      "mediaCount",
  },
];

const isProviderConfirmedMetric = (
  account,
  field
) => {
  const value =
    account[field.accountKey];

  return (
    account.metricsAvailability?.[field.manualKey] &&
    Number.isFinite(
      Number(value)
    )
  );
};

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
export const connectInstagram = asyncHandler(
  async (req, res) => {
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
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Instagram OAuth URL generated successfully",
        data: {
          authURL,
        },
      })
    );
  }
);

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
    const {
      code,
      state,
      error,
      error_reason,
    } = req.query;

    if (error) {
      logger.warn(
        "Instagram OAuth cancelled or rejected by provider",
        {
          reason:
            error_reason || error,
        }
      );

      return res.redirect(
        getFrontendInstagramRedirect({
          status:
            "error",
          code:
            "oauth_cancelled",
          message:
            "Instagram authorization was not completed.",
        })
      );
    }

    if (!code || !state) {
      return res.redirect(
        getFrontendInstagramRedirect({
          status:
            "error",
          code:
            "missing_callback_params",
          message:
            "Instagram did not return the required OAuth parameters.",
        })
      );
    }

    try {
      const userId =
        await getUserIdFromState(
          state
        );

      const tokenData =
        await exchangeCodeForToken(
          code
        );

      const accessToken =
        tokenData.access_token;

      if (!accessToken) {
        throw new AppError(
          "Failed to obtain access token",
          502
        );
      }

      const accountInfo =
        await getInstagramAccountInfo(
          accessToken
        );

      const existingAccount =
        await InstagramAccount.findOne({
          instagramUserId:
            accountInfo.instagramUserId,
        });

      if (existingAccount) {
        if (
          existingAccount.user.toString() !==
          userId.toString()
        ) {
          throw new AppError(
            "Instagram account already connected",
            409
          );
        }

        existingAccount.set({
          ...definedAccountFields(
            accountInfo
          ),

          accessToken,

          isPrimary:
            true,

          isActive:
            true,

          lastSyncedAt:
            new Date(),
        });

        await existingAccount.save();

        await deleteOAuthState(
          state
        );

        return res.redirect(
          getFrontendInstagramRedirect({
            status:
              "success",
            code:
              "reconnected",
            message:
              "Instagram account reconnected successfully.",
          })
        );
      }

      await InstagramAccount.create({
        user:
          userId,

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

        follows:
          accountInfo.follows,

        mediaCount:
          accountInfo.mediaCount,

        accountType:
          accountInfo.accountType,

        displayName:
          accountInfo.displayName,

        metricsAvailability:
          accountInfo.metricsAvailability,

        accessToken,

        isPrimary:
          true,

        lastSyncedAt:
          new Date(),
      });

      await deleteOAuthState(
        state
      );

      return res.redirect(
        getFrontendInstagramRedirect({
          status:
            "success",
          code:
            "success",
          message:
            "Instagram account connected successfully.",
        })
      );
    } catch (callbackError) {
      await deleteOAuthState(
        state
      ).catch(() => {});

      const code =
        normalizeOAuthErrorCode(
          callbackError
        );

      logger.warn(
        "Instagram OAuth callback failed",
        {
          code,
          statusCode:
            callbackError.statusCode,
        }
      );

      return res.redirect(
        getFrontendInstagramRedirect({
          status:
            "error",
          code,
          message:
            "Instagram connection could not be completed.",
        })
      );
    }
  });

/**
 * --------------------------------------------------
 * Update Manual Instagram Metrics
 * --------------------------------------------------
 * PATCH /api/instagram/manual-metrics
 */
export const updateManualInstagramMetrics =
  asyncHandler(async (req, res) => {
    const account =
      await InstagramAccount.findOne({
        user:
          req.user._id,
        isActive:
          true,
      });

    if (!account) {
      throw new AppError(
        "No connected Instagram account found",
        404
      );
    }

    const now =
      new Date();

    for (const field of manualMetricFields) {
      if (
        !Object.hasOwn(
          req.body,
          field.requestKey
        )
      ) {
        continue;
      }

      const value =
        req.body[field.requestKey];

      if (
        value !== null &&
        isProviderConfirmedMetric(
          account,
          field
        )
      ) {
        throw new AppError(
          "Provider-confirmed metrics cannot be replaced with manual estimates",
          409
        );
      }

      account.set(
        `manualMetrics.${field.manualKey}.value`,
        value
      );
      account.set(
        `manualMetrics.${field.manualKey}.updatedAt`,
        value === null ? null : now
      );
      account.set(
        `manualMetrics.${field.manualKey}.confirmedByUser`,
        value !== null
          ? true
          : false
      );
    }

    await account.save();

    const metrics =
      buildAccountMetrics(
        account
      );

    logger.info(
      "Manual Instagram metrics updated",
      {
        userId:
          req.user._id.toString(),
        metricKeys:
          manualMetricFields
            .filter((field) =>
              Object.hasOwn(
                req.body,
                field.requestKey
              )
            )
            .map((field) => field.manualKey),
      }
    );

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message:
          "Manual Instagram metrics updated successfully. CreatorIQ will use these values as limited estimates when Meta does not return provider-confirmed data.",
        data: {
          analysisMode: {
            mode:
              hasManualMetrics(metrics)
                ? "manual-estimate"
                : "provider-data",
            message:
              hasManualMetrics(metrics)
                ? "Meta did not return complete account metrics, so manually confirmed values are available for limited scoring, AI planning, and dashboard guidance."
                : "Provider-confirmed metrics are available for this account.",
          },
          account: {
            id:
              account._id,
            username:
              account.username,
            displayName:
              account.displayName,
            profileImage:
              account.profileImage,
            accountType:
              account.accountType,
            followers:
              metrics.followers.value,
            follows:
              metrics.follows.value,
            mediaCount:
              metrics.mediaCount.value,
            metrics,
            metricsAvailability:
              account.metricsAvailability,
            manualMetrics:
              account.manualMetrics,
            hasManualMetrics:
              hasManualMetrics(
                metrics
              ),
            lastSyncedAt:
              account.lastSyncedAt,
          },
        },
      })
    );
  });
