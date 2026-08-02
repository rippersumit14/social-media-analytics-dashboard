import express from "express";

import protect from "../middlewares/authMiddleware.js";
import {
  aiChatRateLimiter,
} from "../middlewares/rateLimiter.js";

import {
  generateInsights,
  getInsights,
} from "../controllers/creatorInsightsController.js";

const router = express.Router();

/**
 * --------------------------------------------------
 * Protected Routes
 * --------------------------------------------------
 */

router.use(protect);

/**
 * --------------------------------------------------
 * Generate Insights
 * --------------------------------------------------
 */

router.post(
  "/generate",
  aiChatRateLimiter,
  generateInsights
);

/**
 * --------------------------------------------------
 * Get Insights
 * --------------------------------------------------
 */

router.get(
  "/",
  getInsights
);

export default router;
