import express from "express";

import protect from "../middlewares/authMiddleware.js";

import {
  createSnapshot,
  getLatestSnapshot,
  getAnalyticsSnapshots,
} from "../controllers/instagramAnalyticsController.js";

const router = express.Router();

/**
 * --------------------------------------------------
 * All Analytics Routes Protected
 * --------------------------------------------------
 */

router.use(protect);

/**
 * --------------------------------------------------
 * Create Snapshot
 * --------------------------------------------------
 * POST /api/instagram/analytics/snapshot
 */

router.post(
  "/snapshot",
  createSnapshot
);

/**
 * --------------------------------------------------
 * Latest Snapshot
 * --------------------------------------------------
 * GET /api/instagram/analytics/latest
 */

router.get(
  "/latest",
  getLatestSnapshot
);

/**
 * --------------------------------------------------
 * Analytics History
 * --------------------------------------------------
 * GET /api/instagram/analytics/history
 */

router.get(
  "/history",
  getAnalyticsSnapshots
);

export default router;