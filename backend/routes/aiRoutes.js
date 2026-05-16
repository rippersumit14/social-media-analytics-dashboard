import express from "express";

import protect from "../middleware/authMiddleware.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";

import { getAIInsights } from "../controllers/aiController.js";

import {
  chatWithAI,
  chatWithAIStream,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../controllers/chatController.js";

import { uploadImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * Generate AI insights
 * for selected social account.
 */
router.post(
  "/insights/:socialAccountId",
  protect,
  aiRateLimiter,
  getAIInsights
);

/**
 * Normal AI chat route.
 *
 * Supports:
 * - text-only
 * - image-only
 * - text + multiple images
 *
 * Frontend sends:
 * multipart/form-data
 *
 * images field:
 * images[]
 */
router.post(
  "/chat/:socialAccountId",
  protect,
  aiRateLimiter,

  /**
   * Parse multiple uploaded images.
   *
   * Max:
   * - 5 images
   */
  uploadImages.array("images", 5),

  chatWithAI
);

/**
 * Streaming AI chat route.
 *
 * Used for ChatGPT-like
 * live typing UI.
 *
 * Supports:
 * - text
 * - multiple images
 * - streaming responses
 */
router.post(
  "/chat/:socialAccountId/stream",
  protect,

  /**
   * Parse uploaded images.
   */
  uploadImages.array("images", 5),

  chatWithAIStream
);

/**
 * Get all chat sessions
 * of selected social account.
 */
router.get(
  "/chat/sessions/:socialAccountId",
  protect,
  getChatSessions
);

/**
 * Get all messages
 * of selected session.
 */
router.get(
  "/chat/session/:sessionId/messages",
  protect,
  getSessionMessages
);

/**
 * Rename chat session.
 */
router.patch(
  "/chat/session/:sessionId",
  protect,
  renameChatSession
);

/**
 * Delete chat session.
 *
 * Also deletes:
 * - messages
 * - uploaded cloud images
 */
router.delete(
  "/chat/session/:sessionId",
  protect,
  deleteChatSession
);

export default router;