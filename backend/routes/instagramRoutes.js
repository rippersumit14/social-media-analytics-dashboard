import express from "express";

import protect from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  instagramManualMetricsRateLimiter,
} from "../middlewares/rateLimiter.js";

import {
  connectInstagram,
  instagramOAuthCallback,
  updateManualInstagramMetrics,
} from "../controllers/instagramController.js";
import {
  manualInstagramMetricsSchema,
} from "../validators/instagramMetricValidators.js";

const router = express.Router();

/**
 * --------------------------------------------------
 * Connect Instagram
 * --------------------------------------------------
 * GET /api/instagram/connect
 *
 * Protected Route
 *
 * Generates OAuth URL and stores
 * OAuth state in Redis.
 */

router.get(
  "/connect",
  protect,
  connectInstagram
);

router.patch(
  "/manual-metrics",
  protect,
  instagramManualMetricsRateLimiter,
  validateRequest(
    manualInstagramMetricsSchema
  ),
  updateManualInstagramMetrics
);

/**
 * --------------------------------------------------
 * Instagram OAuth Callback
 * --------------------------------------------------
 * GET /api/instagram/oauth/callback
 *
 * Meta redirects here after:
 * - User login
 * - Permission approval
 *
 * IMPORTANT:
 * Do NOT protect this route.
 *
 * Meta calls this endpoint,
 * not the frontend user.
 */

router.get(
  "/oauth/callback",
  instagramOAuthCallback
);

export default router;
