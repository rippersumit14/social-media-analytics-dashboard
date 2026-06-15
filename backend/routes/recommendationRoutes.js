import express from "express";

import protect from "../middlewares/authMiddleware.js";

import {
  generateRecommendationsController,
  getRecommendationsController,
} from "../controllers/recommendationController.js";

/**
 * --------------------------------------------------
 * Recommendation Routes
 * --------------------------------------------------
 *
 * Base Route:
 *
 * /api/recommendations
 *
 * Endpoints:
 *
 * POST /generate
 * GET /
 *
 */

const router = express.Router();

/**
 * --------------------------------------------------
 * Generate Recommendations
 * --------------------------------------------------
 *
 * Creates fresh recommendations
 * for the authenticated user.
 */

router.post(
  "/generate",  
  protect,
  generateRecommendationsController
);

/**
 * --------------------------------------------------
 * Get Recommendations
 * --------------------------------------------------
 *
 * Returns latest active recommendations.
 */

router.get(
  "/",
  protect,
  getRecommendationsController
);

export default router;