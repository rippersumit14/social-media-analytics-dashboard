import express from "express";
import { getAIInsights } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";
import { chatWithAI } from "../controllers/chatController.js";

const router = express.Router();

/**
 * @route   POST /api/ai/insights/:socialAccountId
 * @desc    Generate AI insights
 * @access  Private
 */
router.post("/insights/:socialAccountId", protect, getAIInsights, aiRateLimiter);


router.post("/chat/:socialAccountId", protect, aiRateLimiter, chatWithAI);

export default router;