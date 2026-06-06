import express from "express";

import protect from "../middlewares/authMiddleware.js";

import {
  connectInstagram,
  instagramOAuthCallback,
} from "../controllers/instagramController.js";

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