import express from "express";
import { getAIInsights } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";
import {
  chatWithAI,
  chatWithAIStream,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../controllers/chatController.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * Generate AI insights for selected social account.
 */
router.post(
  "/insights/:socialAccountId",
  protect,
  aiRateLimiter,
  getAIInsights
);

/**
 * Stream AI chat response.
 *
 * Used for ChatGPT-like typing response.
 *
 * Note:
 * aiRateLimiter is temporarily removed here because
 * usage limit is already handled inside chatController.
 */
router.post(
  "/chat/:socialAccountId/stream",
  protect,
  uploadImage.single("image"),
  chatWithAIStream
);

/**
 * Normal non-streaming AI chat route.
 *
 * Kept as fallback route.
 */
router.post(
  "/chat/:socialAccountId",
  protect,
  uploadImage.single("image"),
  chatWithAI
);

/**
 * Get all chat sessions for selected account.
 */
router.get(
  "/chat/sessions/:socialAccountId",
  protect,
  getChatSessions
);

/**
 * Get messages of selected chat session.
 */
router.get(
  "/chat/session/:sessionId/messages",
  protect,
  getSessionMessages
);

/**
 * Rename selected chat session.
 */
router.patch(
  "/chat/session/:sessionId",
  protect,
  renameChatSession
);

/**
 * Delete selected chat session and its messages.
 */
router.delete(
  "/chat/session/:sessionId",
  protect,
  deleteChatSession
);

export default router;