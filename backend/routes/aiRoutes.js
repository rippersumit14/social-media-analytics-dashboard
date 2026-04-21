import express from "express";
import { getAIInsights } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/ai/insights/:socialAccountId
 * @desc    Generate AI insights
 * @access  Private
 */
router.post("/insights/:socialAccountId", protect, getAIInsights);

export default router;