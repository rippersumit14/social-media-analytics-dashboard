import express from "express";
import { getAIInsights } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";
import {
  chatWithAI,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../controllers/chatController.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/ai/insights/:socialAccountId
 * @desc    Generate AI insights
 * @access  Private
 */
router.post(
  "/insights/:socialAccountId",
  protect,
  aiRateLimiter,
  getAIInsights
);

/**
 * @route   POST /api/ai/chat/:socialAccountId
 * @desc    Chat with AI
 * @access  Private
 */
router.post(
  "/chat/:socialAccountId",
  protect,
  aiRateLimiter,
  uploadImage.single("image"),
  chatWithAI
);

/**
 * @route   GET /api/ai/chat/sessions/:socialAccountId
 * @desc    Get all chat sessions for selected social account
 * @access  Private
 */
router.get(
  "/chat/sessions/:socialAccountId",
  protect,
  getChatSessions
);

/**
 * @route   GET /api/ai/chat/session/:sessionId/messages
 * @desc    Get messages of selected chat session
 * @access  Private
 */
router.get(
  "/chat/session/:sessionId/messages",
  protect,
  getSessionMessages
);

/**
 * @route   PATCH /api/ai/chat/session/:sessionId
 * @desc    Rename chat session
 * @access  Private
 */
router.patch(
  "/chat/session/:sessionId",
  protect,
  renameChatSession
);

/**
 * @route   DELETE /api/ai/chat/session/:sessionId
 * @desc    Delete chat session
 * @access  Private
 */
router.delete(
  "/chat/session/:sessionId",
  protect,
  deleteChatSession
);

export default router;