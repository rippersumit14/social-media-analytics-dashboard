import express from "express";

import protect from "../middlewares/authMiddleware.js";

import {
  calculateScore,
  getLatestScore,
  getScoreHistory,
} from "../controllers/creatorScoreController.js";

const router = express.Router();

/**
 * --------------------------------------------------
 * Protected Routes
 * --------------------------------------------------
 */

router.use(protect);

/**
 * --------------------------------------------------
 * Calculate Creator Score
 * --------------------------------------------------
 */

router.post(
  "/calculate",
  calculateScore
);

/**
 * --------------------------------------------------
 * Latest Creator Score
 * --------------------------------------------------
 */

router.get(
  "/latest",
  getLatestScore
);

/**
 * --------------------------------------------------
 * Creator Score History
 * --------------------------------------------------
 */

router.get(
  "/history",
  getScoreHistory
);

export default router;